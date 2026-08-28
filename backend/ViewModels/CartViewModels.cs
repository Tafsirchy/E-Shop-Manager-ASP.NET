using EShopManager.API.Models;

namespace EShopManager.API.ViewModels
{
    public class CartItemRow
    {
        public CartItem Item { get; set; } = null!;
        public Product? Product { get; set; }
    }

    public class CartIndexViewModel
    {
        public List<CartItemRow> Rows { get; set; } = new();
        public decimal Total { get; set; }
        public bool IsSignedIn { get; set; }
        public string? AppliedCouponCode { get; set; }
        public decimal CouponDiscount { get; set; }
        public decimal CouponTotal { get; set; }
    }

    public class ApplyCouponInput
    {
        public string? CouponCode { get; set; }
        public string? ReturnUrl { get; set; }
    }

    public class AddToCartInput
    {
        public string ProductId { get; set; } = null!;
        public int Quantity { get; set; } = 1;
        public string? VariantId { get; set; }
        public string? ReturnUrl { get; set; }
    }

    public class UpdateCartQuantityInput
    {
        public string ItemId { get; set; } = null!;
        public int Quantity { get; set; }
        public string? ReturnUrl { get; set; }
    }

    public class RemoveCartItemInput
    {
        public string ItemId { get; set; } = null!;
        public string? ReturnUrl { get; set; }
    }

    public class WishlistToggleInput
    {
        public string ProductId { get; set; } = null!;
        public string? ReturnUrl { get; set; }
    }
}
