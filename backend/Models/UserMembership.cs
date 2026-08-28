using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class UserMembership
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string UserId { get; set; } = null!;
        public decimal TotalSpent { get; set; }
        public string CurrentRole { get; set; } = "Regular"; // Regular, Premium
        public int RewardPoints { get; set; }
        public List<ClaimedCoupon> ClaimedCoupons { get; set; } = new();
    }

    public class ClaimedCoupon
    {
        public string Code { get; set; } = null!;
        public decimal DiscountValue { get; set; }
        public int RequiredPoints { get; set; }
        public DateTime ClaimedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Active"; // Active, Used
    }
}
