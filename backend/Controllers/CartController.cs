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
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.Email)?.Value ?? "guest";

        [HttpGet]
        public async Task<ActionResult<Cart>> Get()
        {
            var cart = await _cartService.GetCartAsync(GetUserId());
            return cart ?? new Cart { UserId = GetUserId() };
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem(CartItem item)
        {
            var res = await _cartService.AddToCartAsync(GetUserId(), item);
            if (!res.Success)
            {
                return BadRequest(new { success = false, message = res.Message, available = res.Available });
            }

            return Ok(new { success = true, cart = res.Payload });
        }

        [HttpDelete("items/{itemId}")]
        public async Task<IActionResult> RemoveItem(string itemId, [FromQuery] string? variantId = null)
        {
            await _cartService.RemoveFromCartAsync(GetUserId(), itemId, variantId);
            return NoContent();
        }

        [HttpPut("items/{itemId}")]
        public async Task<IActionResult> UpdateItemQuantity(string itemId, [FromBody] UpdateQuantityRequest request)
        {
            var res = await _cartService.UpdateQuantityAsync(GetUserId(), itemId, request.Quantity);
            if (!res.Success)
            {
                return BadRequest(new { success = false, message = res.Message, available = res.Available });
            }

            return Ok(new { success = true, cart = res.Payload });
        }
    }

    public class UpdateQuantityRequest
    {
        public int Quantity { get; set; }
    }
}
