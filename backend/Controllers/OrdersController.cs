using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    [Authorize]
    public class OrdersController : Controller
    {
        private static readonly string[] AllowedStatuses =
            { "Pending", "Processing", "In Transit", "Shipped", "Delivered", "Cancelled" };

        private readonly OrderService _orderService;
        private readonly ProductService _productService;
        private readonly UserService _userService;
        private readonly EmailService _emailService;
        private readonly PdfService _pdfService;
        private readonly CurrentUser _me;

        public OrdersController(OrderService orderService, ProductService productService,
            UserService userService, EmailService emailService, PdfService pdfService, CurrentUser me)
        {
            _orderService = orderService;
            _productService = productService;
            _userService = userService;
            _emailService = emailService;
            _pdfService = pdfService;
            _me = me;
        }

        private bool CanAccess(Order? order) =>
            order != null &&
            (order.UserId == _me.Email || string.Equals(_me.Role, UserRole.Admin.ToString()));

        public async Task<IActionResult> Index()
        {
            var orders = await _orderService.GetUserOrdersAsync(_me.Email);
            foreach (var order in orders)
            {
                foreach (var item in order.Items)
                {
                    if (string.IsNullOrWhiteSpace(item.ProductName))
                    {
                        var product = await _productService.GetAsync(item.ProductId);
                        item.ProductName = product?.Name ?? item.ProductName;
                    }
                }
            }
            return View(new OrdersIndexViewModel
            {
                Orders = orders.OrderByDescending(o => o.CreatedAt).ToList()
            });
        }

        public async Task<IActionResult> Details(string id)
        {
            var order = await _orderService.GetOrderAsync(id);
            if (!CanAccess(order))
                return NotFound();

            var history = await _orderService.GetHistoryAsync(id);

            // Hydrate product names for display; fall back to stored snapshot or ID.
            foreach (var item in order!.Items)
            {
                if (string.IsNullOrWhiteSpace(item.ProductName))
                {
                    var product = await _productService.GetAsync(item.ProductId);
                    item.ProductName = product?.Name ?? item.ProductName;
                }
            }

            return View(new OrderDetailsViewModel
            {
                Order = order,
                History = history,
                IsAdmin = string.Equals(_me.Role, UserRole.Admin.ToString())
            });
        }

        public async Task<IActionResult> Invoice(string id)
        {
            var result = await LoadInvoiceAsync(id);

            if (result.Accessible == false)
                return NotFound();

            // Pending and Cancelled orders can't be viewed/downloaded yet.
            if (result.Downloadable == false)
            {
                TempData["StatusMessage"] = "The invoice becomes downloadable once your payment is confirmed and the order is being processed.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Details), new { id });
            }

            return View(result.Model);
        }

        // Loads the invoice data for the given order and reports whether the order
        // is accessible (owned by the current user or admin) and downloadable
        // (payment cleared, status Processing or later).
        private async Task<(InvoiceViewModel? Model, bool Accessible, bool Downloadable)> LoadInvoiceAsync(string id)
        {
            var order = await _orderService.GetOrderAsync(id);
            if (!CanAccess(order))
                return (null, false, false);

            // Invoices are available once payment is cleared and the order has
            // moved past "Pending" (i.e. "Processing" or later).
            if (order!.Status == "Pending" || order.Status == "Cancelled")
                return (null, true, false);

            var customer = await _userService.GetByEmailAsync(order.UserId);

            var lines = new List<InvoiceLine>();
            foreach (var item in order.Items)
            {
                var product = await _productService.GetAsync(item.ProductId);
                lines.Add(new InvoiceLine
                {
                    Name = product?.Name ?? item.ProductName ?? $"Product {item.ProductId}",
                    Category = product?.Category ?? "",
                    Quantity = item.Quantity,
                    UnitPrice = item.Price,
                    LineTotal = item.Price * item.Quantity
                });
            }

            var model = new InvoiceViewModel
            {
                Order = order,
                CustomerName = customer?.Name ?? order.UserId,
                CustomerEmail = customer?.Email ?? order.UserId,
                Lines = lines
            };

            return (model, true, true);
        }

        // Generates and returns the invoice as a downloadable PDF file.
        public async Task<IActionResult> InvoicePdf(string id)
        {
            var result = await LoadInvoiceAsync(id);
            if (result.Downloadable != true)
                return NotFound();

            var html = InvoicePdfHtml.Build(result.Model!);
            var bytes = await _pdfService.RenderAsync(html, "invoice");
            if (bytes == null)
            {
                TempData["StatusMessage"] = "Could not generate the invoice PDF. Please try again.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Details), new { id });
            }

            var fileName = $"Invoice-{id}.pdf";
            return File(bytes, "application/pdf", fileName);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateStatus(UpdateOrderStatusInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Status) || !AllowedStatuses.Contains(input.Status))
            {
                TempData["Message"] = $"Status must be one of: {string.Join(", ", AllowedStatuses)}.";
                TempData["MessageIsError"] = true;
                return RedirectToAction("Index", "Admin");
            }

            var order = await _orderService.GetOrderAsync(input.Id);
            if (order == null) return NotFound();

            await _orderService.UpdateOrderStatusAsync(input.Id, input.Status, input.Note);

            if (!string.IsNullOrWhiteSpace(input.TrackingNumber))
                await _orderService.SetTrackingNumberAsync(input.Id, input.TrackingNumber.Trim());

            // Notify the customer when their order is marked Delivered.
            if (string.Equals(input.Status, "Delivered", StringComparison.OrdinalIgnoreCase))
            {
                var user = await _userService.GetByEmailAsync(order.UserId);
                if (user != null)
                {
                    _emailService.SendDeliveredAsync(
                        user.Email, user.Name, order.Id ?? input.Id, input.TrackingNumber ?? order.TrackingNumber);
                }
            }

            TempData["Message"] = $"Order {input.Id[..8]}... updated to {input.Status}.";
            return RedirectToAction("Details", "Orders", new { id = input.Id });
        }
    }
}
