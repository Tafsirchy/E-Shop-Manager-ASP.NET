using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace EShopManager.API.Controllers.Api
{
    [ApiController]
    [Route("api/products")]
    public class ApiProductsController : ControllerBase
    {
        private readonly ProductService _products;

        public ApiProductsController(ProductService products)
        {
            _products = products;
        }

        [HttpGet]
        [OutputCache(PolicyName = "CatalogGet30s")]
        public async Task<ActionResult<IEnumerable<Product>>> GetAll(
            [FromQuery] string? search, [FromQuery] string? category,
            [FromQuery] string? sort, [FromQuery] int limit = 50)
        {
            var items = await _products.GetAsync(search, category);

            items = sort switch
            {
                "price_asc" => items.OrderBy(p => p.Price).ToList(),
                "price_desc" => items.OrderByDescending(p => p.Price).ToList(),
                "name" => items.OrderBy(p => p.Name).ToList(),
                _ => items
            };

            Response.Headers["X-Catalog-Source"] = "api";
            return Ok(items.Take(Math.Clamp(limit, 1, 200)));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetOne(string id)
        {
            var product = await _products.GetAsync(id);
            if (product == null) return NotFound(new { error = $"Product '{id}' not found." });
            return Ok(product);
        }
    }
}
