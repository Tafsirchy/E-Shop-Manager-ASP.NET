using EShopManager.API.Models;

namespace EShopManager.API.ViewModels
{
    public class WishlistRow
    {
        public WishlistItem Item { get; set; } = null!;
        public Product? Product { get; set; }
    }

    public class WishlistIndexViewModel
    {
        public List<WishlistRow> Rows { get; set; } = new();
    }

    public class OrdersIndexViewModel
    {
        public List<Order> Orders { get; set; } = new();
    }

    public class OrderDetailsViewModel
    {
        public Order Order { get; set; } = null!;
    }
}
