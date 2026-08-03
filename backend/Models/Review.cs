using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EShopManager.API.Models
{
    public class Review
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string ProductId { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string? OrderId { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public List<string> Images { get; set; } = new();
        public string? VideoUrl { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public int HelpfulCount { get; set; }
        public int ReportCount { get; set; }
        public bool IsFlagged { get; set; }
        public string Status { get; set; } = "approved";
        public ReviewReply? SellerReply { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EditedAt { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class ReviewReply
    {
        public string Text { get; set; } = null!;
        public DateTime RepliedAt { get; set; } = DateTime.UtcNow;
    }

    public class ReviewCreateRequest
    {
        public string ProductId { get; set; } = null!;
        public string? OrderId { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public List<string> Images { get; set; } = new();
        public string? VideoUrl { get; set; }
    }

    public class ReviewUpdateRequest
    {
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public List<string> Images { get; set; } = new();
        public string? VideoUrl { get; set; }
    }

    public class ReviewReplyRequest
    {
        public string Text { get; set; } = null!;
    }
}
