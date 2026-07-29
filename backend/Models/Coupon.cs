using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class Coupon
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Code { get; set; } = null!;
        public decimal DiscountValue { get; set; }
        public int RequiredPoints { get; set; } // Points needed to claim
    }
}
