using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class UserSubscription
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string UserId { get; set; } = null!;
        public string PackageId { get; set; } = null!;
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime? NextBillingDate { get; set; }
        public string Status { get; set; } = "Active"; // Active, Expired, Renewed, Cancelled
    }
}
