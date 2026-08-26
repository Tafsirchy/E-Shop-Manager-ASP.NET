using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class ReviewService
    {
        private readonly IMongoCollection<Review> _reviewsCollection;
        private readonly IMongoCollection<Product> _productsCollection;

        public ReviewService(IMongoDatabase database)
        {
            _reviewsCollection = database.GetCollection<Review>("Reviews");
            _productsCollection = database.GetCollection<Product>("Products");

            var productIndex = Builders<Review>.IndexKeys.Ascending(x => x.ProductId).Ascending(x => x.Status).Ascending(x => x.CreatedAt);
            _reviewsCollection.Indexes.CreateOne(new CreateIndexModel<Review>(productIndex));
        }

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

            var existing = await _reviewsCollection.Find(x => x.ProductId == request.ProductId && x.UserId == userId && !x.IsDeleted).AnyAsync().ConfigureAwait(false);
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

            await _reviewsCollection.InsertOneAsync(review).ConfigureAwait(false);
            await UpdateProductRatingAsync(request.ProductId).ConfigureAwait(false);
            return (review, null);
        }

        private async Task UpdateProductRatingAsync(string productId)
        {
            var reviews = await _reviewsCollection.Find(x => x.ProductId == productId && x.Status == "approved" && !x.IsDeleted).ToListAsync().ConfigureAwait(false);
            var aggregate = ReviewAggregationHelper.CalculateAverage(reviews.Select(x => new ReviewSummary { Rating = x.Rating }));

            var update = Builders<Product>.Update
                .Set(x => x.AverageRating, aggregate.AverageRating)
                .Set(x => x.ReviewCount, aggregate.ReviewCount);

            await _productsCollection.UpdateOneAsync(x => x.Id == productId, update).ConfigureAwait(false);
        }
    }
}
