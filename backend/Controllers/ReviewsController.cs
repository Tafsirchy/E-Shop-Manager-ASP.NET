using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    public class ReviewsController : Controller
    {
        private readonly ReviewService _reviewService;
        private readonly CurrentUser _me;

        public ReviewsController(ReviewService reviewService, CurrentUser me)
        {
            _reviewService = reviewService;
            _me = me;
        }

        [Authorize]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(string productId, int rating, string? title, string? comment)
        {
            if (string.IsNullOrWhiteSpace(productId)) return NotFound();

            var (review, error) = await _reviewService.CreateAsync(new ReviewCreateRequest
            {
                ProductId = productId,
                Rating = rating,
                Title = title,
                Comment = comment
            }, _me.ReviewerKey);

            if (review == null)
            {
                TempData["StatusMessage"] = error ?? "Unable to submit review.";
                TempData["StatusIsError"] = true;
            }
            else
            {
                TempData["StatusMessage"] = "Thanks! Your review was submitted and is pending approval.";
                TempData["StatusIsError"] = false;
            }

            return RedirectToAction("Details", "Products", new { id = productId });
        }
    }
}
