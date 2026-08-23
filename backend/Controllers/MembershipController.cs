using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    [Authorize]
    public class MembershipController : Controller
    {
        private readonly MembershipService _membershipService;
        private readonly CurrentUser _me;

        public MembershipController(MembershipService membershipService, CurrentUser me)
        {
            _membershipService = membershipService;
            _me = me;
        }

        public async Task<IActionResult> Index()
        {
            var membership = await _membershipService.GetMembershipAsync(_me.Email);
            return View(new MembershipIndexViewModel { Membership = membership });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ClaimCoupon(ClaimCouponInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Code))
            {
                TempData["StatusMessage"] = "Please enter a coupon code.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Index));
            }

            var error = await _membershipService.ClaimCouponAsync(_me.Email, input.Code.Trim().ToUpper());
            TempData["StatusMessage"] = error ?? "Coupon claimed successfully!";
            TempData["StatusIsError"] = error != null;
            return RedirectToAction(nameof(Index));
        }
    }
}
