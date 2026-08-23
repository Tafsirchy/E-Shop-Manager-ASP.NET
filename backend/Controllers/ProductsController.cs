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
        private readonly IWebHostEnvironment _env;

        public ProductsController(ProductService productService, ReviewService reviewService,
            CurrentUser me, IWebHostEnvironment env)
        {
            _productService = productService;
            _reviewService = reviewService;
            _me = me;
            _env = env;
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
        [RequestSizeLimit(Services.ImageUploadValidator.RequestSizeLimitBytes)]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            var validationError = Services.ImageUploadValidator.Validate(file);
            if (validationError != null)
                return BadRequest(new { error = validationError });

            var ext = Path.GetExtension(file!.FileName).ToLowerInvariant();

            await using var stream = file.OpenReadStream();
            if (!Services.ImageUploadValidator.HasValidSignature(stream, ext))
                return BadRequest(new { error = "File content does not match its extension." });

            var folder = DateTime.UtcNow.ToString("yyyy-MM");
            var directory = Path.Combine(_env.WebRootPath, "uploads", folder);
            Directory.CreateDirectory(directory);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            await using (var output = System.IO.File.Create(Path.Combine(directory, fileName)))
            {
                await stream.CopyToAsync(output);
            }

            return Ok(new { url = $"/uploads/{folder}/{fileName}" });
        }

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
            if (!TryValidateImageUrl(product.ImageUrl, out var imageError))
            {
                ModelState.AddModelError(nameof(Product.ImageUrl), imageError!);
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

            if (!TryValidateImageUrl(updated.ImageUrl, out var imageError))
            {
                ModelState.AddModelError(nameof(Product.ImageUrl), imageError!);
                return View(updated);
            }

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
   .Where(line => Uri.TryCreate(line, UriKind.Absolute, out var uri)
                  && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
   .ToList();

    private static bool TryValidateImageUrl(string? url, out string? error)
    {
        error = null;
        if (string.IsNullOrWhiteSpace(url)) return true;

        if (url.Length > 2048)
        {
            error = "Image URL must be 2048 characters or fewer.";
            return false;
        }

        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            error = "Image URL must be a valid absolute http(s) URL.";
            return false;
        }

        return true;
    }

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
