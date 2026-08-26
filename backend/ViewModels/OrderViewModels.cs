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
        public List<OrderStatusHistory> History { get; set; } = new();
        public bool IsAdmin { get; set; }
    }

    public class InvoiceLine
    {
        public string Name { get; set; } = null!;
        public string Category { get; set; } = "";
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class InvoiceViewModel
    {
        public Order Order { get; set; } = null!;
        public string CustomerName { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public List<InvoiceLine> Lines { get; set; } = new();
    }
}
