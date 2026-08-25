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
            var package = await _subscriptionService.GetPackageAsync(packageId);
            if (package == null)
            {
                TempData["StatusMessage"] = "Package not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Index));
            }

            var domain = $"{Request.Scheme}://{Request.Host}";
            var options = new Stripe.Checkout.SessionCreateOptions
            {
                LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
                {
                    new Stripe.Checkout.SessionLineItemOptions
                    {
                        PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(package.Price * 100),
                            Currency = "bdt",
                            ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                            {
                                Name = package.Name,
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = domain + Url.Action("PaymentSuccess", "Subscriptions", new { type = "prebuilt", packageId }),
                CancelUrl = domain + Url.Action("PaymentCancel", "Subscriptions"),
            };

            var service = new Stripe.Checkout.SessionService();
            var session = service.Create(options);

            return Redirect(session.Url);
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

            var membership = await _membershipService.GetMembershipAsync(_me.Email);
            var quote = _subscriptionService.BuildCustomPackage(features, 500m, membership.TotalSpent);

            var domain = $"{Request.Scheme}://{Request.Host}";
            var options = new Stripe.Checkout.SessionCreateOptions
            {
                LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
                {
                    new Stripe.Checkout.SessionLineItemOptions
                    {
                        PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(quote.Price * 100),
                            Currency = "bdt",
                            ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                            {
                                Name = quote.Name,
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = domain + Url.Action("PaymentSuccess", "Subscriptions", new { type = "custom", features = string.Join(",", features) }),
                CancelUrl = domain + Url.Action("PaymentCancel", "Subscriptions"),
            };

            var service = new Stripe.Checkout.SessionService();
            var session = service.Create(options);

            return Redirect(session.Url);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> PaymentSuccess(string type, string? packageId, string? features)
        {
            try
            {
                if (type == "prebuilt" && !string.IsNullOrEmpty(packageId))
                {
                    await _subscriptionService.SubscribeAsync(_me.Email, packageId);
                }
                else if (type == "custom" && !string.IsNullOrEmpty(features))
                {
                    var featureList = features.Split(',').ToList();
                    var membership = await _membershipService.GetMembershipAsync(_me.Email);
                    await _subscriptionService.SubscribeCustomAsync(_me.Email, featureList, membership.TotalSpent);
                }
                TempData["StatusMessage"] = "Payment successful! Subscription activated.";
                TempData["StatusIsError"] = false;
            }
            catch (Exception ex)
            {
                TempData["StatusMessage"] = ex.Message;
                TempData["StatusIsError"] = true;
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult PaymentCancel()
        {
            TempData["StatusMessage"] = "Payment was cancelled.";
            TempData["StatusIsError"] = true;
            return RedirectToAction(nameof(Index));
        }
    }
}
