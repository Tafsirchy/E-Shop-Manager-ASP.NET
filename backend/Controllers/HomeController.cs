using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    public class HomeController : Controller
    {
        private readonly ProductService _productService;
        private readonly WishlistService _wishlistService;
        private readonly CurrentUser _me;

        public HomeController(ProductService productService, WishlistService wishlistService, CurrentUser me)
        {
            _productService = productService;
            _wishlistService = wishlistService;
            _me = me;
        }

        public async Task<IActionResult> Index()
        {
            var products = await _productService.GetAsync();
            var wishlistedIds = await GetWishlistedIdsAsync();
            ViewBag.WishlistedIds = wishlistedIds;
            var model = new HomeIndexViewModel
            {
                NewArrivals = products
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(8)
                    .ToList()
            };
            return View(model);
        }

        public IActionResult About() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Newsletter(string email)
        {
            var valid = !string.IsNullOrWhiteSpace(email) &&
                        new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email);
            TempData["StatusMessage"] = valid
                ? "You're on the list! Watch your inbox for exclusive drops."
                : "Please enter a valid email address.";
            TempData["StatusIsError"] = !valid;
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult Contact() => View(new ContactInput());

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Contact(ContactInput model)
        {
            if (!ModelState.IsValid) return View(model);
            TempData["StatusMessage"] = $"Thanks, {model.Name.Split(' ')[0]}! We've received your message and will get back to you shortly.";
            TempData["StatusIsError"] = false;
            return RedirectToAction(nameof(Contact));
        }

        public IActionResult Shipping() => View();

        public IActionResult Faq() => View();

        public IActionResult Lookbook() => View();

        public IActionResult AccessDenied() => View();

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error(int? statusCode)
        {
            ViewData["StatusCode"] = statusCode;
            return View();
        }

        private async Task<HashSet<string>> GetWishlistedIdsAsync()
        {
            var owner = _me.OwnerKey;
            var isGuest = !_me.IsAuthenticated;
            var wl = isGuest ? await _wishlistService.GetByGuestAsync(owner) : await _wishlistService.GetByUserAsync(owner);
            return wl?.Items.Select(i => i.ProductId).ToHashSet() ?? new HashSet<string>();
        }
    }
}
