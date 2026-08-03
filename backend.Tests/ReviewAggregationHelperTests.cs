using EShopManager.API.Services;
using Xunit;

namespace Backend.Tests;

public class ReviewAggregationHelperTests
{
    [Fact]
    public void CalculateAverageRating_ReturnsRoundedAverageAndCount()
    {
        var reviews = new[]
        {
            new ReviewSummary { Rating = 5 },
            new ReviewSummary { Rating = 4 },
            new ReviewSummary { Rating = 4 },
            new ReviewSummary { Rating = 2 }
        };

        var result = ReviewAggregationHelper.CalculateAverage(reviews);

        Assert.Equal(3.8m, result.AverageRating);
        Assert.Equal(4, result.ReviewCount);
    }
}
