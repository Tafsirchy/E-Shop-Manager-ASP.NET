using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = null!;
        public string Brand { get; set; } = "E-Shop";
        public string Sku { get; set; } = string.Empty;
        public string Category { get; set; } = null!;
        public string? Subcategory { get; set; }
        public string ShortDescription { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; }
        public string StockStatus { get; set; } = "In Stock";
        public string? ImageUrl { get; set; }
        public List<string> GalleryImages { get; set; } = new();
        public string? Badge { get; set; }
        public string? Warranty { get; set; }
        public string? DeliveryEstimate { get; set; }
        public string? ReturnPolicy { get; set; }
        public string? SeoDescription { get; set; }
        public string? CanonicalUrl { get; set; }
        public decimal AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public List<ProductSpec> Specs { get; set; } = new();
        public List<ProductVariant> Variants { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ProductSpec
    {
        public string Name { get; set; } = null!;
        public string Value { get; set; } = null!;
    }

    public class ProductVariant
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string Type { get; set; } = "Color";
        public string Value { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsAvailable => Stock > 0;
    }
}
