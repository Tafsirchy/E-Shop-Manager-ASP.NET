using System.Security.Claims;
using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers.Api
{
    [ApiController]
    [Route("api/orders")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ApiOrdersController : ControllerBase
    {
        private readonly OrderService _orders;

        public ApiOrdersController(OrderService orders)
        {
            _orders = orders;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetMine()
        {
            var orders = await _orders.GetUserOrdersAsync(UserId);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOne(string id)
        {
            var order = await _orders.GetOrderAsync(id);
            if (order == null) return NotFound(new { error = "Order not found." });

            var isOwner = order.UserId == UserId;
            var isAdmin = User.IsInRole("Admin");
            if (!isOwner && !isAdmin) return Forbid();

            return Ok(order);
        }
    }
}
