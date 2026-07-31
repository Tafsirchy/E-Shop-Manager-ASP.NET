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
        private readonly MembershipService _membershipService;

        public SubscriptionsController(SubscriptionService subscriptionService, MembershipService membershipService)
        {
            _subscriptionService = subscriptionService;
            _membershipService = membershipService;
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
        public async Task<IActionResult> BuildCustomPackage([FromBody] List<string> features)
        {
            var membership = await _membershipService.GetMembershipAsync(GetUserId());
            var package = _subscriptionService.BuildCustomPackage(features ?? new List<string>(), 500m, membership.TotalSpent);
            return Ok(package);
        }

        [Authorize]
        [HttpPost("custom/purchase")]
        public async Task<IActionResult> PurchaseCustomPackage([FromBody] List<string> features)
        {
            var membership = await _membershipService.GetMembershipAsync(GetUserId());
            try
            {
                var sub = await _subscriptionService.SubscribeCustomAsync(GetUserId(), features ?? new List<string>(), membership.TotalSpent);
                return Ok(sub);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
