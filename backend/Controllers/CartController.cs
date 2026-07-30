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

        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveItem(string productId)
        {
            await _cartService.RemoveFromCartAsync(GetUserId(), productId);
            return NoContent();
        }
    }
}
