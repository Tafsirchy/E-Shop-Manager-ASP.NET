using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires login
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.Email)?.Value ?? "guest";

        [HttpGet]
        public async Task<ActionResult<Cart>> Get()
        {
            var cart = await _cartService.GetCartAsync(GetUserId());
            return cart ?? new Cart { UserId = GetUserId() };
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem(CartItem item)
        {
            await _cartService.AddToCartAsync(GetUserId(), item);
            return Ok();
        }

        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveItem(string productId)
        {
            await _cartService.RemoveFromCartAsync(GetUserId(), productId);
            return NoContent();
        }
    }
}
