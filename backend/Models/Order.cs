using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    [BsonDiscriminator(RootClass = true)]
    [BsonKnownTypes(typeof(RegularOrder), typeof(PremiumOrder), typeof(BulkOrder))]
    public abstract class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string UserId { get; set; } = null!;
        public List<CartItem> Items { get; set; } = new();
        public decimal Subtotal { get; set; }
        public decimal CategoryDiscountApplied { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountApplied { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Processing, Delivered, Cancelled
        public string? TrackingNumber { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public abstract void ApplyDiscount();
    }

    public class RegularOrder : Order
    {
        public override void ApplyDiscount()
        {
            DiscountApplied = 0;
            // TotalAmount remains unchanged
        }
    }

    public class PremiumOrder : Order
    {
        public override void ApplyDiscount()
        {
            DiscountApplied = TotalAmount * 0.10m; // 10% discount for premium members
            TotalAmount -= DiscountApplied;
        }
    }

    public class BulkOrder : Order
    {
        public override void ApplyDiscount()
        {
            DiscountApplied = TotalAmount * 0.15m; // 15% discount for bulk orders
            TotalAmount -= DiscountApplied;
        }
    }
}
