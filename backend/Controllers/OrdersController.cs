using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private static readonly string[] AllowedStatuses =
            { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" };

        private readonly OrderService _orderService;
        private readonly CartService _cartService;
        private readonly MembershipService _membershipService;

        public OrdersController(OrderService orderService, CartService cartService, MembershipService membershipService)
        {
            _orderService = orderService;
            _cartService = cartService;
            _membershipService = membershipService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.Email)?.Value ?? "guest";

        [HttpGet]
        public async Task<List<Order>> GetUserOrders() =>
            await _orderService.GetUserOrdersAsync(GetUserId());

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Order>> GetOrder(string id)
        {
            var order = await _orderService.GetOrderAsync(id);
            if (order == null || (order.UserId != GetUserId() && !User.IsInRole("Admin")))
            {
                return NotFound();
            }
            return order;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout()
        {
            var cart = await _cartService.GetCartAsync(GetUserId());
            if (cart == null || !cart.Items.Any()) return BadRequest(new { message = "Cart is empty" });

            // Order type is derived server-side from membership and cart contents,
            // never from client-supplied input.
            var membership = await _membershipService.GetMembershipAsync(GetUserId());
            var totalQuantity = cart.Items.Sum(i => i.Quantity);

            Order newOrder;
            if (membership.CurrentRole == "Premium") newOrder = new PremiumOrder();
            else if (totalQuantity > 10) newOrder = new BulkOrder();
            else newOrder = new RegularOrder();

            newOrder.UserId = GetUserId();
            newOrder.Items = cart.Items;

            try
            {
                var placedOrder = await _orderService.PlaceOrderAsync(newOrder);
                await _cartService.ClearCartAsync(GetUserId()); // clear cart after order
                return Ok(placedOrder);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:length(24)}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] string status)
        {
            if (string.IsNullOrWhiteSpace(status) || !AllowedStatuses.Contains(status))
            {
                return BadRequest(new { message = $"Status must be one of: {string.Join(", ", AllowedStatuses)}." });
            }

            var order = await _orderService.GetOrderAsync(id);
            if (order == null) return NotFound();

            await _orderService.UpdateOrderStatusAsync(id, status);
            return NoContent();
        }
    }
}
