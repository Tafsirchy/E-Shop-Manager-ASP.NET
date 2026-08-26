using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class OrderStatusHistory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string OrderId { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
