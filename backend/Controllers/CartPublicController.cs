using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]/guest")]
    public class CartPublicController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartPublicController(CartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet("{guestId}")]
        public async Task<IActionResult> GetGuestCart(string guestId)
        {
            var cart = await _cartService.GetCartAsync(guestId);
            if (cart == null) return Ok(new Cart { UserId = guestId });
            return Ok(cart);
        }

        [HttpPost("{guestId}/items")]
        public async Task<IActionResult> AddGuestItem(string guestId, CartItem item)
        {
            var res = await _cartService.AddToCartAsync(guestId, item);
            if (!res.Success)
                return BadRequest(new { success = false, message = res.Message, available = res.Available });
            return Ok(new { success = true, cart = res.Payload });
        }

        [HttpDelete("{guestId}/items/{productId}")]
        public async Task<IActionResult> RemoveGuestItem(string guestId, string productId)
        {
            await _cartService.RemoveFromCartAsync(guestId, productId);
            return NoContent();
        }
    }
}
