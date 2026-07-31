using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly WishlistService _wishlistService;

        public WishlistController(WishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        // ---- Authenticated user endpoints (identity from JWT) ----

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            var wl = await _wishlistService.GetByUserAsync(GetUserId());
            return Ok(wl ?? new Wishlist { UserId = GetUserId() });
        }

        [HttpPost("items")]
        [Authorize]
        public async Task<IActionResult> AddItem(WishlistItem item)
        {
            var productError = await _wishlistService.ValidateProductAsync(item.ProductId);
            if (productError != null) return BadRequest(new { message = productError });

            await _wishlistService.AddItemAsync(GetUserId(), false, item);
            var wl = await _wishlistService.GetByUserAsync(GetUserId());
            return Ok(wl);
        }

        [HttpDelete("items/{itemId}")]
        [Authorize]
        public async Task<IActionResult> RemoveItem(string itemId)
        {
            await _wishlistService.RemoveItemAsync(GetUserId(), false, itemId);
            return NoContent();
        }

        // ---- Guest endpoints (guestSessionId is self-identifying) ----

        [HttpGet("guest/{guestId}")]
        public async Task<IActionResult> GetGuest(string guestId)
        {
            var wl = await _wishlistService.GetByGuestAsync(guestId);
            return Ok(wl ?? new Wishlist { GuestSessionId = guestId });
        }

        [HttpPost("guest/{guestId}/items")]
        public async Task<IActionResult> AddGuestItem(string guestId, WishlistItem item)
        {
            var productError = await _wishlistService.ValidateProductAsync(item.ProductId);
            if (productError != null) return BadRequest(new { message = productError });

            await _wishlistService.AddItemAsync(guestId, true, item);
            var wl = await _wishlistService.GetByGuestAsync(guestId);
            return Ok(wl);
        }

        [HttpDelete("guest/{guestId}/items/{itemId}")]
        public async Task<IActionResult> RemoveGuestItem(string guestId, string itemId)
        {
            await _wishlistService.RemoveItemAsync(guestId, true, itemId);
            return NoContent();
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.Email)?.Value ?? "";
    }
}
