using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionsController : ControllerBase
    {
        private readonly SubscriptionService _subscriptionService;

        public SubscriptionsController(SubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.Email)?.Value ?? "guest";

        [HttpGet("packages")]
        public async Task<List<SubscriptionPackage>> GetPackages() =>
            await _subscriptionService.GetPackagesAsync();

        [Authorize(Roles = "Admin")]
        [HttpPost("packages")]
        public async Task<IActionResult> CreatePackage(SubscriptionPackage package)
        {
            await _subscriptionService.CreatePackageAsync(package);
            return Ok(package);
        }

        [Authorize]
        [HttpPost("custom/build")]
        public IActionResult BuildCustomPackage([FromBody] List<string> features, [FromQuery] decimal userSpentTotal = 0)
        {
            // Base price per feature is 500
            var package = _subscriptionService.BuildCustomPackage(features, 500m, userSpentTotal);
            return Ok(package);
        }

        [Authorize]
        [HttpPost("purchase/{packageId}")]
        public async Task<IActionResult> Purchase(string packageId)
        {
            try
            {
                var sub = await _subscriptionService.SubscribeAsync(GetUserId(), packageId);
                return Ok(sub);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("my-subscriptions")]
        public async Task<List<UserSubscription>> GetMySubscriptions() =>
            await _subscriptionService.GetUserSubscriptionsAsync(GetUserId());
    }
}
