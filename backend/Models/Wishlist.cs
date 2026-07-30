using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class Wishlist
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Either UserId (authenticated) or GuestSessionId (guest)
        public string? UserId { get; set; }
        public string? GuestSessionId { get; set; }

        public List<WishlistItem> Items { get; set; } = new();

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class WishlistItem
    {
        public string ItemId { get; set; } = Guid.NewGuid().ToString();
        public string ProductId { get; set; } = null!;
        public string? VariantId { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        public bool NotifyOnPriceDrop { get; set; } = false;
        public string? Notes { get; set; }
    }
}
