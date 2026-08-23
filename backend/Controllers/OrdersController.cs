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
            { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" };

        private readonly OrderService _orderService;
        private readonly ProductService _productService;
        private readonly UserService _userService;
        private readonly CurrentUser _me;

        public OrdersController(OrderService orderService, ProductService productService,
            UserService userService, CurrentUser me)
        {
            _orderService = orderService;
            _productService = productService;
            _userService = userService;
            _me = me;
        }

        private bool CanAccess(Order? order) =>
            order != null &&
            (order.UserId == _me.Email || string.Equals(_me.Role, UserRole.Admin.ToString()));

        public async Task<IActionResult> Index()
        {
            var orders = await _orderService.GetUserOrdersAsync(_me.Email);
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

            return View(new OrderDetailsViewModel { Order = order! });
        }

        public async Task<IActionResult> Invoice(string id)
        {
            var order = await _orderService.GetOrderAsync(id);
            if (!CanAccess(order))
                return NotFound();

            var customer = await _userService.GetByEmailAsync(order!.UserId);

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

            return View(new InvoiceViewModel
            {
                Order = order,
                CustomerName = customer?.Name ?? order.UserId,
                CustomerEmail = customer?.Email ?? order.UserId,
                Lines = lines
            });
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

            await _orderService.UpdateOrderStatusAsync(input.Id, input.Status);
            TempData["Message"] = $"Order {input.Id[..8]}... updated to {input.Status}.";
            return RedirectToAction("Index", "Admin");
        }
    }
}
