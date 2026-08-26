using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace EShopManager.API.Controllers
{
    /// <summary>
    /// Lean read-only catalog endpoint powering live search suggestions.
    /// Returns projected fields only - never full product documents.
    /// </summary>
    [ApiController]
    [Route("api/products")]
    public class SearchApiController : ControllerBase
    {
        public record ProductSuggestionDto(string Id, string Name, string Category, decimal Price, string? ImageUrl);

        private readonly ProductService _products;

        public SearchApiController(ProductService products) => _products = products;

        [HttpGet]
        [OutputCache(PolicyName = "CatalogGet30s")]
        public async Task<ActionResult<IEnumerable<ProductSuggestionDto>>> Suggestions(string? search, int limit = 6)
        {
            var term = search?.Trim() ?? "";
            if (term.Length < 2) return Ok(Array.Empty<ProductSuggestionDto>());

            var capped = Math.Clamp(limit, 1, 10);
            var matches = await _products.GetAsync(term, null);

            var suggestions = new List<ProductSuggestionDto>(capped);
            foreach (var p in matches)
            {
                if (suggestions.Count >= capped) break;
                suggestions.Add(new ProductSuggestionDto(
                    p.Id ?? "",
                    p.Name,
                    p.Category ?? "",
                    p.Price,
                    p.ImageUrl));
            }

            return Ok(suggestions);
        }
    }
}
