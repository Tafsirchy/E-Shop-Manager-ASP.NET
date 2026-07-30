using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class Cart
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string UserId { get; set; } = null!;
        public List<CartItem> Items { get; set; } = new();
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        // optimistic concurrency version
        public int Version { get; set; } = 1;
    }

    public class CartItem
    {
        public string ItemId { get; set; } = Guid.NewGuid().ToString();
        public string ProductId { get; set; } = null!;
        public string? VariantId { get; set; }
        public string? ProductName { get; set; }
        public int Quantity { get; set; }
        // snapshot of price when added
        public decimal UnitPriceSnapshot { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        // Backwards-compatible Price property used by orders
        public decimal Price { get => UnitPriceSnapshot; set => UnitPriceSnapshot = value; }
    }
}
