using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminAnalyticsService _analyticsService;
        private readonly CartService _cartService;
        private readonly WishlistService _wishlistService;
        private readonly UserService _userService;

        public AdminController(AdminAnalyticsService analyticsService, CartService cartService, WishlistService wishlistService, UserService userService)
        {
            _analyticsService = analyticsService;
            _cartService = cartService;
            _wishlistService = wishlistService;
            _userService = userService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var stats = await _analyticsService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users.Select(u => new { u.Id, u.Name, u.Email, u.Role, u.CreatedAt }));
        }

        [HttpPost("merge-guest")]
        public async Task<IActionResult> MergeGuest([FromBody] MergeGuestRequest req)
        {
            var cartRes = await _cartService.MergeGuestIntoUserAsync(req.GuestSessionId, req.UserId);
            await _wishlistService.MergeGuestIntoUserAsync(req.GuestSessionId, req.UserId);

            return Ok(new { mergedCartCount = cartRes.Items.Count, conflicts = cartRes.Conflicts });
        }
    }

    public class MergeGuestRequest
    {
        public string GuestSessionId { get; set; } = null!;
        public string UserId { get; set; } = null!;
    }
}
