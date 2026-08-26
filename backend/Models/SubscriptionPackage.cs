using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class SubscriptionPackage
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Type { get; set; } = "Prebuilt"; // Prebuilt or Custom
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public string BillingType { get; set; } = "Monthly"; // One-time or Monthly
        public List<string> Features { get; set; } = new();
        public SubscriptionOffer? Offer { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class SubscriptionOffer
    {
        public decimal Threshold { get; set; }
        public decimal Discount { get; set; } // Percentage discount
    }
}
