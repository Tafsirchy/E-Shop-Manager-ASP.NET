namespace EShopManager.API.Models
{
    public class User
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;

        [MongoDB.Bson.Serialization.Attributes.BsonRepresentation(MongoDB.Bson.BsonType.String)]
        public UserRole Role { get; set; } = UserRole.Customer;

        /// <summary>Bumped whenever authorization-relevant state (e.g. Role) changes;
        /// tokens carrying an older value are rejected, forcing re-authentication.</summary>
        public int SecurityStamp { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
