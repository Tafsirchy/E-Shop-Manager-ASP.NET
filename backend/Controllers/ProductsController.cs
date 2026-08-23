using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    public class ProductsController : Controller
    {
        private readonly ProductService _productService;
        private readonly ReviewService _reviewService;
        private readonly CurrentUser _me;

        public ProductsController(ProductService productService, ReviewService reviewService, CurrentUser me)
        {
            _productService = productService;
            _reviewService = reviewService;
            _me = me;
        }

        public async Task<IActionResult> Index(string? search, string? category, string? sort)
        {
            var products = await _productService.GetAsync(search, category);
            products = sort switch
            {
                "new" => products.OrderByDescending(p => p.CreatedAt).ToList(),
                "price-asc" => products.OrderBy(p => p.Price).ToList(),
                "price-desc" => products.OrderByDescending(p => p.Price).ToList(),
                "stock" => products.OrderByDescending(p => p.Stock).ToList(),
                "name-asc" => products.OrderBy(p => p.Name, StringComparer.OrdinalIgnoreCase).ToList(),
                _ => products
            };

            return View(new ProductListViewModel
            {
                Products = products,
                Search = search,
                Category = category,
                Sort = sort
            });
        }

        public async Task<IActionResult> Details(string id)
        {
            var product = await _productService.GetAsync(id);
            if (product == null) return NotFound();

            var reviews = await _reviewService.GetForProductAsync(id, limit: 6);
            return View(new ProductDetailsViewModel
            {
                Product = product,
                Reviews = reviews,
                IsSignedIn = _me.IsAuthenticated,
                StatusMessage = TempData["StatusMessage"] as string,
                StatusIsError = TempData["StatusIsError"] as bool? ?? false
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult Create() => View(new Product());

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Product product, string? galleryInput)
        {
            if (!ModelState.IsValid) return View(product);

            if (string.IsNullOrWhiteSpace(product.Name))
            {
                ModelState.AddModelError(nameof(Product.Name), "Name is required.");
                return View(product);
            }
            if (string.IsNullOrWhiteSpace(product.Category))
            {
                ModelState.AddModelError(nameof(Product.Category), "Category is required.");
                return View(product);
            }

            product.GalleryImages = ParseGalleryInput(galleryInput);
            await _productService.CreateAsync(product);
            TempData["StatusMessage"] = $"Product \"{product.Name}\" created.";
            return RedirectToAction("Index", "Admin");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            var product = await _productService.GetAsync(id);
            if (product == null) return NotFound();
            return View(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, Product updated, string? galleryInput)
        {
            if (!ModelState.IsValid) return View(updated);

            var existing = await _productService.GetAsync(id);
            if (existing == null) return NotFound();

            updated.Id = existing.Id;
            updated.CreatedAt = existing.CreatedAt;
            updated.AverageRating = existing.AverageRating;
            updated.ReviewCount = existing.ReviewCount;
            updated.GalleryImages = ParseGalleryInput(galleryInput);
            await _productService.UpdateAsync(id, updated);
            TempData["StatusMessage"] = $"Product \"{updated.Name}\" updated.";
            return RedirectToAction("Index", "Admin");
        }

        private static List<string> ParseGalleryInput(string? galleryInput) =>
            (galleryInput ?? "")
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(line => Uri.TryCreate(line, UriKind.Absolute, out _))
                .ToList();

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            await _productService.RemoveAsync(id);
            TempData["StatusMessage"] = "Product deleted.";
            return RedirectToAction("Products", "Admin");
        }
    }
}
