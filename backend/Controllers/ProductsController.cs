using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductsController(ProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<List<Product>> Get([FromQuery] string? search, [FromQuery] string? category) =>
            await _productService.GetAsync(search, category);

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Product>> Get(string id)
        {
            var product = await _productService.GetAsync(id);

            if (product is null)
            {
                return NotFound();
            }

            return product;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Post(Product newProduct)
        {
            var validationError = ValidateProduct(newProduct);
            if (validationError != null) return BadRequest(new { message = validationError });

            await _productService.CreateAsync(newProduct);
            return CreatedAtAction(nameof(Get), new { id = newProduct.Id }, newProduct);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Product updatedProduct)
        {
            var product = await _productService.GetAsync(id);

            if (product is null)
            {
                return NotFound();
            }

            var validationError = ValidateProduct(updatedProduct);
            if (validationError != null) return BadRequest(new { message = validationError });

            updatedProduct.Id = product.Id;
            await _productService.UpdateAsync(id, updatedProduct);

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var product = await _productService.GetAsync(id);

            if (product is null)
            {
                return NotFound();
            }

            await _productService.RemoveAsync(id);

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("low-stock")]
        public async Task<List<Product>> GetLowStock([FromQuery] int threshold = 10) =>
            await _productService.GetLowStockProductsAsync(threshold);

        private static string? ValidateProduct(Product p)
        {
            if (string.IsNullOrWhiteSpace(p.Name)) return "Product name is required.";
            if (string.IsNullOrWhiteSpace(p.Category)) return "Product category is required.";
            if (p.Price < 0) return "Price cannot be negative.";
            if (p.Stock < 0) return "Stock cannot be negative.";
            return null;
        }
    }
}
