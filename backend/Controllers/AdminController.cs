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
        private static readonly string[] AllowedOrderStatuses =
            { "Pending", "Processing", "In Transit", "Shipped", "Delivered", "Cancelled" };

        private readonly AdminAnalyticsService _analyticsService;
        private readonly ProductService _productService;
        private readonly UserService _userService;
        private readonly SubscriptionService _subscriptionService;
        private readonly MembershipService _membershipService;
        private readonly OrderService _orderService;

        public AdminController(AdminAnalyticsService analyticsService, ProductService productService,
            UserService userService, SubscriptionService subscriptionService, MembershipService membershipService,
            OrderService orderService)
        {
            _analyticsService = analyticsService;
            _productService = productService;
            _userService = userService;
            _subscriptionService = subscriptionService;
            _membershipService = membershipService;
            _orderService = orderService;
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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateRole(string id, string role)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                TempData["StatusMessage"] = "User not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Users));
            }

            if (string.Equals(user.Email, User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
                    System.StringComparison.OrdinalIgnoreCase))
            {
                TempData["StatusMessage"] = "You cannot change your own role.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Users));
            }

            await _userService.UpdateRoleAsync(id, role);
            TempData["StatusMessage"] = $"Updated {user.Email} role to {role}.";
            return RedirectToAction(nameof(Users));
        }

        [HttpGet]
        public async Task<IActionResult> Orders(string? status)
        {
            var orders = await _orderService.GetAllOrdersAsync();
            if (!string.IsNullOrWhiteSpace(status) && status != "All")
            {
                orders = orders.Where(o => string.Equals(o.Status, status, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            return View(new AdminOrdersViewModel
            {
                Orders = orders.OrderByDescending(o => o.CreatedAt).ToList(),
                Status = string.IsNullOrWhiteSpace(status) ? "All" : status
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateOrderStatus(string id, string status, string? trackingNumber, string? note)
        {
            if (!AllowedOrderStatuses.Contains(status))
            {
                TempData["StatusMessage"] = $"Status must be one of: {string.Join(", ", AllowedOrderStatuses)}.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Orders));
            }

            var order = await _orderService.GetOrderAsync(id);
            if (order == null)
            {
                TempData["StatusMessage"] = "Order not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Orders));
            }

            await _orderService.UpdateOrderStatusAsync(id, status, note);
            if (!string.IsNullOrWhiteSpace(trackingNumber))
                await _orderService.SetTrackingNumberAsync(id, trackingNumber.Trim());

            TempData["StatusMessage"] = $"Order #{id[..Math.Min(8, id.Length)]} updated to {status}.";
            return RedirectToAction(nameof(Orders));
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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdatePackage(string id, string name, decimal price, string billingType, string? features)
        {
            var package = await _subscriptionService.GetPackageAsync(id);
            if (package == null)
            {
                TempData["StatusMessage"] = "Package not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Subscriptions));
            }

            if (string.IsNullOrWhiteSpace(name))
            {
                TempData["StatusMessage"] = "Package name is required.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Subscriptions));
            }

            package.Name = name.Trim();
            package.Price = price;
            package.BillingType = string.IsNullOrWhiteSpace(billingType) ? "Monthly" : billingType;
            package.Features = (features ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
            await _subscriptionService.UpdatePackageAsync(package);

            TempData["StatusMessage"] = $"Package \"{package.Name}\" updated.";
            return RedirectToAction(nameof(Subscriptions));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> TogglePackage(string id)
        {
            var package = await _subscriptionService.GetPackageAsync(id);
            if (package == null)
            {
                TempData["StatusMessage"] = "Package not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Subscriptions));
            }
            await _subscriptionService.TogglePackageActiveAsync(id, !package.IsActive);
            TempData["StatusMessage"] = $"Package \"{package.Name}\" {(package.IsActive ? "deactivated" : "activated")}.";
            return RedirectToAction(nameof(Subscriptions));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeletePackage(string id)
        {
            var package = await _subscriptionService.GetPackageAsync(id);
            if (package == null)
            {
                TempData["StatusMessage"] = "Package not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Subscriptions));
            }
            await _subscriptionService.DeletePackageAsync(id);
            TempData["StatusMessage"] = $"Package \"{package.Name}\" deleted.";
            return RedirectToAction(nameof(Subscriptions));
        }

        [HttpGet]
        public async Task<IActionResult> Coupons()
        {
            var coupons = await _membershipService.GetAllCouponsAsync();
            return View(new AdminCouponsViewModel { Coupons = coupons });
        }

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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateCoupon(string id, string code, decimal discountValue, int requiredPoints)
        {
            var coupon = await _membershipService.GetCouponAsync(id);
            if (coupon == null)
            {
                TempData["StatusMessage"] = "Coupon not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Coupons));
            }

            if (string.IsNullOrWhiteSpace(code) || discountValue <= 0)
            {
                TempData["StatusMessage"] = "Code and a positive discount value are required.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Coupons));
            }

            coupon.Code = code.Trim().ToUpper();
            coupon.DiscountValue = discountValue;
            coupon.RequiredPoints = Math.Max(0, requiredPoints);
            await _membershipService.UpdateCouponAsync(coupon);
            TempData["StatusMessage"] = $"Coupon {coupon.Code} updated.";
            return RedirectToAction(nameof(Coupons));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteCoupon(string id)
        {
            var coupon = await _membershipService.GetCouponAsync(id);
            if (coupon == null)
            {
                TempData["StatusMessage"] = "Coupon not found.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Coupons));
            }
            await _membershipService.DeleteCouponAsync(id);
            TempData["StatusMessage"] = $"Coupon {coupon.Code} deleted.";
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
