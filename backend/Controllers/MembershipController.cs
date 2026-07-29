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
    public class MembershipController : ControllerBase
    {
        private readonly MembershipService _membershipService;

        public MembershipController(MembershipService membershipService)
        {
            _membershipService = membershipService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.Email)?.Value ?? "guest";

        [HttpGet]
        public async Task<UserMembership> Get() =>
            await _membershipService.GetMembershipAsync(GetUserId());

        [HttpPost("claim-coupon/{code}")]
        public async Task<IActionResult> ClaimCoupon(string code)
        {
            var success = await _membershipService.ClaimCouponAsync(GetUserId(), code);
            if (success) return Ok(new { message = "Coupon claimed successfully!" });
            return BadRequest("Insufficient points or invalid coupon");
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPost("coupons")]
        public async Task<IActionResult> CreateCoupon(Coupon coupon)
        {
            await _membershipService.CreateCouponAsync(coupon);
            return Ok(coupon);
        }
    }
}
