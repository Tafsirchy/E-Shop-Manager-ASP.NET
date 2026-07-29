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
        private readonly OrderService _orderService;
        private readonly CartService _cartService;

        public OrdersController(OrderService orderService, CartService cartService)
        {
            _orderService = orderService;
            _cartService = cartService;
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
        public async Task<IActionResult> Checkout([FromQuery] string orderType = "Regular")
        {
            var cart = await _cartService.GetCartAsync(GetUserId());
            if (cart == null || !cart.Items.Any()) return BadRequest("Cart is empty");

            Order newOrder;
            if (orderType == "Premium") newOrder = new PremiumOrder();
            else if (orderType == "Bulk" || cart.Items.Sum(i => i.Quantity) > 10) newOrder = new BulkOrder();
            else newOrder = new RegularOrder();

            newOrder.UserId = GetUserId();
            newOrder.Items = cart.Items;
            
            var placedOrder = await _orderService.PlaceOrderAsync(newOrder);
            await _cartService.ClearCartAsync(GetUserId()); // clear cart after order

            return Ok(placedOrder);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:length(24)}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] string status)
        {
            await _orderService.UpdateOrderStatusAsync(id, status);
            return NoContent();
        }
    }
}
