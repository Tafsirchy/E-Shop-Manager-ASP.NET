using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId)
        {
            var wl = await _wishlistService.GetByUserAsync(userId);
            if (wl == null) return NotFound();
            return Ok(wl);
        }

        [HttpPost("user/{userId}/items")]
        public async Task<IActionResult> AddToUser(string userId, WishlistItem item)
        {
            await _wishlistService.AddItemAsync(userId, false, item);
            var wl = await _wishlistService.GetByUserAsync(userId);
            return Ok(wl);
        }

        [HttpDelete("user/{userId}/items/{itemId}")]
        public async Task<IActionResult> RemoveFromUser(string userId, string itemId)
        {
            await _wishlistService.RemoveItemAsync(userId, false, itemId);
            return NoContent();
        }
    }
}
