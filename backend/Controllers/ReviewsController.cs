using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EShopManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewService _reviewService;

        public ReviewsController(ReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<List<Review>>> GetForProduct(string productId, [FromQuery] int skip = 0, [FromQuery] int limit = 10)
        {
            var reviews = await _reviewService.GetForProductAsync(productId, skip: skip, limit: limit);
            return Ok(reviews);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReviewCreateRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "User not authenticated." });

            var (review, error) = await _reviewService.CreateAsync(request, userId);
            if (review == null) return BadRequest(new { message = error });

            return Ok(review);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ReviewUpdateRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "User not authenticated." });

            var (review, error) = await _reviewService.UpdateAsync(id, request, userId);
            if (review == null) return BadRequest(new { message = error });

            return Ok(review);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Email);
            var isAdmin = User.IsInRole("Admin");
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "User not authenticated." });

            var (success, error) = await _reviewService.DeleteAsync(id, userId, isAdmin);
            if (!success) return BadRequest(new { message = error });

            return Ok(new { message = "Review removed." });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("pending")]
        public async Task<ActionResult<List<Review>>> GetPending()
        {
            var reviews = await _reviewService.GetPendingAsync();
            return Ok(reviews);
        }
    }
}
