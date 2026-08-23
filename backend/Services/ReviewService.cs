using EShopManager.API.Models;
using MongoDB.Driver;
using System.Security.Claims;

namespace EShopManager.API.Services
{
    public class ReviewService
    {
        private readonly IMongoCollection<Review> _reviewsCollection;
        private readonly IMongoCollection<Product> _productsCollection;
        private readonly IMongoCollection<User> _usersCollection;

        public ReviewService(IMongoDatabase database)
        {
            _reviewsCollection = database.GetCollection<Review>("Reviews");
            _productsCollection = database.GetCollection<Product>("Products");
            _usersCollection = database.GetCollection<User>("Customers");

            var productIndex = Builders<Review>.IndexKeys.Ascending(x => x.ProductId).Ascending(x => x.Status).Ascending(x => x.CreatedAt);
            _reviewsCollection.Indexes.CreateOne(new CreateIndexModel<Review>(productIndex));
        }

        public async Task<Review?> GetByIdAsync(string id) =>
            await _reviewsCollection.Find(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();

        public async Task<List<Review>> GetForProductAsync(string productId, string? status = "approved", int skip = 0, int limit = 10)
        {
            var filter = Builders<Review>.Filter.Eq(x => x.ProductId, productId)
                & Builders<Review>.Filter.Eq(x => x.IsDeleted, false);

            if (!string.IsNullOrWhiteSpace(status))
            {
                filter &= Builders<Review>.Filter.Eq(x => x.Status, status);
            }

            return await _reviewsCollection.Find(filter)
                .Sort(Builders<Review>.Sort.Descending(x => x.CreatedAt))
                .Skip(skip)
                .Limit(limit)
                .ToListAsync();
        }

        public async Task<(Review? Review, string? Error)> CreateAsync(ReviewCreateRequest request, string userId)
        {
            if (request.Rating < 1 || request.Rating > 5)
            {
                return (null, "Rating must be between 1 and 5.");
            }

            var existing = await _reviewsCollection.Find(x => x.ProductId == request.ProductId && x.UserId == userId && !x.IsDeleted).AnyAsync();
            if (existing)
            {
                return (null, "You have already reviewed this product.");
            }

            var review = new Review
            {
                ProductId = request.ProductId,
                UserId = userId,
                OrderId = request.OrderId,
                Rating = request.Rating,
                Title = request.Title,
                Comment = request.Comment,
                VideoUrl = request.VideoUrl,
                IsVerifiedPurchase = !string.IsNullOrWhiteSpace(request.OrderId),
                Status = "pending"
            };

            await _reviewsCollection.InsertOneAsync(review);
            await UpdateProductRatingAsync(request.ProductId);
            return (review, null);
        }

        public async Task<(Review? Review, string? Error)> UpdateAsync(string id, ReviewUpdateRequest request, string userId)
        {
            var review = await _reviewsCollection.Find(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
            if (review == null) return (null, "Review not found.");
            if (review.UserId != userId) return (null, "You can only edit your own review.");

            var update = Builders<Review>.Update
                .Set(x => x.Rating, request.Rating)
                .Set(x => x.Title, request.Title)
                .Set(x => x.Comment, request.Comment)
                .Set(x => x.VideoUrl, request.VideoUrl)
                .Set(x => x.UpdatedAt, DateTime.UtcNow)
                .Set(x => x.EditedAt, DateTime.UtcNow)
                .Set(x => x.Status, "pending");

            await _reviewsCollection.UpdateOneAsync(x => x.Id == id, update);
            await UpdateProductRatingAsync(review.ProductId);
            return (await GetByIdAsync(id), null);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(string id, string userId, bool isAdmin = false)
        {
            var review = await _reviewsCollection.Find(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
            if (review == null) return (false, "Review not found.");
            if (!isAdmin && review.UserId != userId) return (false, "You can only delete your own review.");

            var update = Builders<Review>.Update
                .Set(x => x.IsDeleted, true)
                .Set(x => x.Status, "rejected")
                .Set(x => x.UpdatedAt, DateTime.UtcNow);

            await _reviewsCollection.UpdateOneAsync(x => x.Id == id, update);
            await UpdateProductRatingAsync(review.ProductId);
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> AddSellerReplyAsync(string id, string text, string userId, bool isAdmin = false)
        {
            var review = await _reviewsCollection.Find(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
            if (review == null) return (false, "Review not found.");

            var product = await _productsCollection.Find(x => x.Id == review.ProductId).FirstOrDefaultAsync();
            if (product == null) return (false, "Product not found.");

            if (!isAdmin && product.Category != "seller")
            {
                return (false, "Only the seller or an admin can reply to a review.");
            }

            var update = Builders<Review>.Update.Set(x => x.SellerReply, new ReviewReply { Text = text, RepliedAt = DateTime.UtcNow });
            await _reviewsCollection.UpdateOneAsync(x => x.Id == id, update);
            return (true, null);
        }

        public async Task<List<Review>> GetPendingAsync() =>
            await _reviewsCollection.Find(x => x.Status == "pending" && !x.IsDeleted).SortByDescending(x => x.CreatedAt).ToListAsync();

        private async Task UpdateProductRatingAsync(string productId)
        {
            var reviews = await _reviewsCollection.Find(x => x.ProductId == productId && x.Status == "approved" && !x.IsDeleted).ToListAsync();
            var aggregate = ReviewAggregationHelper.CalculateAverage(reviews.Select(x => new ReviewSummary { Rating = x.Rating }));

            var update = Builders<Product>.Update
                .Set(x => x.AverageRating, aggregate.AverageRating)
                .Set(x => x.ReviewCount, aggregate.ReviewCount);

            await _productsCollection.UpdateOneAsync(x => x.Id == productId, update);
        }
    }
}
