using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    public class SubscriptionsController : Controller
    {
        private static readonly List<string> AvailableFeatures = new()
        {
            "Premium Support",
            "Advanced Analytics",
            "Unlimited Products",
            "Custom Domain",
            "API Access"
        };

        private readonly SubscriptionService _subscriptionService;
        private readonly MembershipService _membershipService;
        private readonly CurrentUser _me;

        public SubscriptionsController(SubscriptionService subscriptionService,
            MembershipService membershipService, CurrentUser me)
        {
            _subscriptionService = subscriptionService;
            _membershipService = membershipService;
            _me = me;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var packages = await _subscriptionService.GetPackagesAsync();
            var mySubs = _me.IsAuthenticated
                ? await _subscriptionService.GetUserSubscriptionsAsync(_me.Email)
                : new List<Models.UserSubscription>();

            var lookup = mySubs.Select(s => s.PackageId).ToHashSet();

            return View(new SubscriptionsIndexViewModel
            {
                Packages = packages.Select(p => new SubscriptionPackageRow
                {
                    Package = p,
                    IsSubscribed = lookup.Contains(p.Id!)
                }).ToList(),
                AvailableFeatures = AvailableFeatures,
                MySubscriptions = mySubs,
                PackageLookup = packages.ToDictionary(p => p.Id!),
                Quote = TempData["Quote"] as Models.SubscriptionPackage,
                QuotedFeatures = (TempData["QuotedFeatures"] as List<string>) ?? new List<string>()
            });
        }

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Subscribe(string packageId)
        {
            try
            {
                var sub = await _subscriptionService.SubscribeAsync(_me.Email, packageId);
                TempData["StatusMessage"] = "Subscription activated successfully!";
                TempData["StatusIsError"] = false;
            }
            catch (Exception ex)
            {
                TempData["StatusMessage"] = ex.Message;
                TempData["StatusIsError"] = true;
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> BuildCustom([FromForm] List<string> features)
        {
            if (features == null || features.Count == 0)
            {
                TempData["StatusMessage"] = "Select at least one feature to build a package.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Index));
            }

            var membership = await _membershipService.GetMembershipAsync(_me.Email);
            TempData["Quote"] = _subscriptionService.BuildCustomPackage(features, 500m, membership.TotalSpent);
            TempData["QuotedFeatures"] = features;
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> PurchaseCustom([FromForm] List<string> features)
        {
            if (features == null || features.Count == 0)
            {
                TempData["StatusMessage"] = "Select at least one feature to purchase a package.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Index));
            }

            try
            {
                var membership = await _membershipService.GetMembershipAsync(_me.Email);
                await _subscriptionService.SubscribeCustomAsync(_me.Email, features, membership.TotalSpent);
                TempData["StatusMessage"] = "Custom plan purchased successfully!";
                TempData["StatusIsError"] = false;
            }
            catch (Exception ex)
            {
                TempData["StatusMessage"] = ex.Message;
                TempData["StatusIsError"] = true;
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
