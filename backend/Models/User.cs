namespace EShopManager.API.Models
{
    public class User
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = "Customer"; // Admin or Customer
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
