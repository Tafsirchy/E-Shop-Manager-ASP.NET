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
        private readonly CurrentUser _me;

        public OrdersController(OrderService orderService, CurrentUser me)
        {
            _orderService = orderService;
            _me = me;
        }

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
            if (order == null || (order.UserId != _me.Email && !_me.Role.Equals("Admin")))
                return NotFound();

            return View(new OrderDetailsViewModel { Order = order });
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
