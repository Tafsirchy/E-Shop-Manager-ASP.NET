using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    public class WishlistController : Controller
    {
        private readonly WishlistService _wishlistService;
        private readonly ProductService _productService;
        private readonly CurrentUser _me;

        public WishlistController(WishlistService wishlistService, ProductService productService, CurrentUser me)
        {
            _wishlistService = wishlistService;
            _productService = productService;
            _me = me;
        }

        private bool IsGuest => !_me.IsAuthenticated;

        [HttpGet]
        public async Task<IActionResult> Count()
        {
            var owner = _me.OwnerKey;
            var wl = IsGuest ? await _wishlistService.GetByGuestAsync(owner) : await _wishlistService.GetByUserAsync(owner);
            return Json(new { count = wl?.Items.Count ?? 0 });
        }

        public async Task<IActionResult> Index()
        {
            var owner = _me.OwnerKey;
            var wl = IsGuest ? await _wishlistService.GetByGuestAsync(owner) : await _wishlistService.GetByUserAsync(owner);

            var rows = new List<WishlistRow>();
            foreach (var item in wl?.Items ?? new List<WishlistItem>())
            {
                var product = await _productService.GetAsync(item.ProductId);
                rows.Add(new WishlistRow { Item = item, Product = product });
            }

            return View(new WishlistIndexViewModel { Rows = rows });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Toggle(WishlistToggleInput input)
        {
            var error = await _wishlistService.ValidateProductAsync(input.ProductId);
            if (error != null)
            {
                TempData["StatusMessage"] = error;
                TempData["StatusIsError"] = true;
                return RedirectToLocal(input.ReturnUrl);
            }

            var owner = _me.OwnerKey;
            var wl = IsGuest ? await _wishlistService.GetByGuestAsync(owner) : await _wishlistService.GetByUserAsync(owner);
            var existingItem = wl?.Items.FirstOrDefault(x => x.ProductId == input.ProductId);

            if (existingItem != null)
            {
                await _wishlistService.RemoveItemAsync(owner, IsGuest, existingItem.ItemId);
                TempData["StatusMessage"] = "Removed from wishlist.";
            }
            else
            {
                await _wishlistService.AddItemAsync(owner, IsGuest, new WishlistItem
                {
                    ProductId = input.ProductId,
                    VariantId = null
                });
                TempData["StatusMessage"] = "Added to wishlist.";
            }
            TempData["StatusIsError"] = false;

            return RedirectToLocal(input.ReturnUrl);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Remove(string itemId)
        {
            var owner = _me.OwnerKey;
            await _wishlistService.RemoveItemAsync(owner, IsGuest, itemId);
            return RedirectToAction(nameof(Index));
        }

        private IActionResult RedirectToLocal(string? returnUrl)
        {
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                return Redirect(returnUrl);
            return RedirectToAction(nameof(Index));
        }
    }
}
