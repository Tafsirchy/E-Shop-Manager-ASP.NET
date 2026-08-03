namespace EShopManager.API.Services
{
    public sealed class ReviewSummary
    {
        public int Rating { get; set; }
    }

    public static class ReviewAggregationHelper
    {
        public static (decimal AverageRating, int ReviewCount) CalculateAverage(IEnumerable<ReviewSummary> reviews)
        {
            var list = reviews.ToList();
            if (list.Count == 0) return (0m, 0);

            var average = list.Average(x => x.Rating);
            return ((decimal)Math.Round(average, 1), list.Count);
        }
    }
}
