using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly AdminAnalyticsService _analyticsService;
        private readonly ProductService _productService;
        private readonly UserService _userService;
        private readonly SubscriptionService _subscriptionService;
        private readonly MembershipService _membershipService;

        public AdminController(AdminAnalyticsService analyticsService, ProductService productService,
            UserService userService, SubscriptionService subscriptionService, MembershipService membershipService)
        {
            _analyticsService = analyticsService;
            _productService = productService;
            _userService = userService;
            _subscriptionService = subscriptionService;
            _membershipService = membershipService;
        }

        public async Task<IActionResult> Index()
        {
            var stats = await _analyticsService.GetDashboardStatsAsync();
            dynamic s = stats;

            return View(new AdminDashboardViewModel
            {
                TotalUsers = (long)s.TotalUsers,
                TotalOrders = (int)s.TotalOrders,
                TotalRevenue = (decimal)s.TotalRevenue,
                LowStockCount = (long)s.LowStockCount,
                RecentOrders = ((IEnumerable<Order>)s.RecentOrders).ToList(),
                Message = TempData["Message"] as string ?? TempData["StatusMessage"] as string,
                MessageIsError = TempData["MessageIsError"] as bool? ?? false
            });
        }

        [HttpGet]
        public async Task<IActionResult> Products()
        {
            var products = await _productService.GetAsync();
            return View(new AdminProductsViewModel { Products = products });
        }

        [HttpGet]
        public async Task<IActionResult> Users()
        {
            var users = await _userService.GetAllAsync();
            return View(new AdminUsersViewModel { Users = users });
        }

        [HttpGet]
        public async Task<IActionResult> Subscriptions()
        {
            var packages = await _subscriptionService.GetPackagesAsync(activeOnly: false);
            return View(new AdminPackagesViewModel { Packages = packages });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePackage(string name, decimal price, string billingType, string? features)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                TempData["StatusMessage"] = "Package name is required.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Subscriptions));
            }

            await _subscriptionService.CreatePackageAsync(new SubscriptionPackage
            {
                Type = "Prebuilt",
                Name = name.Trim(),
                Price = price,
                BillingType = billingType ?? "Monthly",
                Features = (features ?? "")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList(),
                IsActive = true
            });

            TempData["StatusMessage"] = "Package created.";
            return RedirectToAction(nameof(Subscriptions));
        }

        [HttpGet]
        public IActionResult Coupons() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateCoupon(Coupon coupon)
        {
            if (string.IsNullOrWhiteSpace(coupon.Code) || coupon.DiscountValue <= 0)
            {
                TempData["StatusMessage"] = "Code and a positive discount value are required.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Coupons));
            }

            coupon.Code = coupon.Code.Trim().ToUpper();
            coupon.RequiredPoints = Math.Max(0, coupon.RequiredPoints);
            await _membershipService.CreateCouponAsync(coupon);
            TempData["StatusMessage"] = $"Coupon {coupon.Code} created.";
            return RedirectToAction(nameof(Coupons));
        }

        [HttpGet]
        public async Task<IActionResult> LowStock(int threshold = 10)
        {
            var products = await _productService.GetLowStockProductsAsync(threshold);
            return View(new AdminLowStockViewModel
            {
                Products = products.OrderBy(p => p.Stock).ToList()
            });
        }
    }
}
