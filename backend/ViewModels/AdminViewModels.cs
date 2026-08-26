using EShopManager.API.Models;

namespace EShopManager.API.ViewModels
{
    public class HomeIndexViewModel
    {
        public List<Product> NewArrivals { get; set; } = new();
    }

    public class ContactInput
    {
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Please enter your name.")]
        public string Name { get; set; } = null!;

        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Please enter a valid email address.")]
        [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = null!;

        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Please enter a message.")]
        public string Message { get; set; } = null!;
    }

    public class AdminDashboardViewModel
    {
        public long TotalUsers { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public long LowStockCount { get; set; }
        public List<Order> RecentOrders { get; set; } = new();
        public string? Message { get; set; }
        public bool MessageIsError { get; set; }
    }

    public class AdminProductsViewModel
    {
        public List<Product> Products { get; set; } = new();
    }

    public class AdminUsersViewModel
    {
        public List<User> Users { get; set; } = new();
    }

    public class AdminPackagesViewModel
    {
        public List<SubscriptionPackage> Packages { get; set; } = new();
    }

    public class AdminLowStockViewModel
    {
        public List<Product> Products { get; set; } = new();
    }

    public class UpdateOrderStatusInput
    {
        public string Id { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? TrackingNumber { get; set; }
        public string? Note { get; set; }
    }
}
