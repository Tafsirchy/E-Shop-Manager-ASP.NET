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

        public AdminController(AdminAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var stats = await _analyticsService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        
            [HttpPost("merge-guest")] 
            public async Task<IActionResult> MergeGuest([FromBody] MergeGuestRequest req)
            {
                // This endpoint can be used for migration: merge guestSessionId into userId
                // Note: For simplicity we resolve services from DI here.
                var cartService = HttpContext.RequestServices.GetRequiredService<EShopManager.API.Services.CartService>();
                var wishlistService = HttpContext.RequestServices.GetRequiredService<EShopManager.API.Services.WishlistService>();

                var cartRes = await cartService.MergeGuestIntoUserAsync(req.GuestSessionId, req.UserId);
                await wishlistService.MergeGuestIntoUserAsync(req.GuestSessionId, req.UserId);

                return Ok(new { mergedCartCount = cartRes.Items.Count, conflicts = cartRes.Conflicts });
            }
    }
    
        public class MergeGuestRequest
        {
            public string GuestSessionId { get; set; } = null!;
            public string UserId { get; set; } = null!;
        }
}
