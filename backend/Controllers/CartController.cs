using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers
{
    public class CartController : Controller
    {
        private readonly CartService _cartService;
        private readonly ProductService _productService;
        private readonly OrderService _orderService;
        private readonly MembershipService _membershipService;
        private readonly CurrentUser _me;

        public CartController(CartService cartService, ProductService productService,
            OrderService orderService, MembershipService membershipService, CurrentUser me)
        {
            _cartService = cartService;
            _productService = productService;
            _orderService = orderService;
            _membershipService = membershipService;
            _me = me;
        }

        public async Task<IActionResult> Index()
        {
            var owner = _me.OwnerKey;
            var cart = await _cartService.GetCartAsync(owner);

            var rows = new List<CartItemRow>();
            foreach (var item in cart?.Items ?? new List<CartItem>())
            {
                var product = await _productService.GetAsync(item.ProductId);
                rows.Add(new CartItemRow { Item = item, Product = product });
            }

            return View(new CartIndexViewModel
            {
                Rows = rows,
                Total = rows.Sum(r => r.Item.UnitPriceSnapshot * r.Item.Quantity),
                IsSignedIn = _me.IsAuthenticated
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Add(AddToCartInput input)
        {
            var result = await _cartService.AddToCartAsync(_me.OwnerKey, new CartItem
            {
                ProductId = input.ProductId,
                Quantity = Math.Max(1, input.Quantity),
                VariantId = input.VariantId,
                ProductName = (await _productService.GetAsync(input.ProductId))?.Name
            });

            if (!result.Success)
            {
                TempData["StatusMessage"] = result.Message == "StaleCart"
                    ? "Your cart was updated elsewhere. Please retry."
                    : result.Message ?? "Unable to add to cart.";
                TempData["StatusIsError"] = true;
            }
            else
            {
                TempData["StatusMessage"] = "Added to cart.";
                TempData["StatusIsError"] = false;
            }

            return RedirectToLocal(input.ReturnUrl);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateQuantity(UpdateCartQuantityInput input)
        {
            var result = await _cartService.UpdateQuantityAsync(_me.OwnerKey, input.ItemId, input.Quantity);
            if (!result.Success)
            {
                TempData["StatusMessage"] = result.Message ?? "Could not update quantity.";
                TempData["StatusIsError"] = true;
            }
            return RedirectToLocal(input.ReturnUrl);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Remove(RemoveCartItemInput input)
        {
            await _cartService.RemoveFromCartAsync(_me.OwnerKey, input.ItemId);
            return RedirectToLocal(input.ReturnUrl);
        }

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Checkout()
        {
            var owner = _me.Email;
            var cart = await _cartService.GetCartAsync(owner);
            if (cart == null || !cart.Items.Any())
            {
                TempData["StatusMessage"] = "Your cart is empty.";
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Index));
            }

            var membership = await _membershipService.GetMembershipAsync(owner);
            var totalQuantity = cart.Items.Sum(i => i.Quantity);

            Order order = membership.CurrentRole == "Premium" ? new PremiumOrder()
                : totalQuantity > 10 ? new BulkOrder()
                : new RegularOrder();

            order.UserId = owner;
            order.Items = cart.Items;

            try
            {
                var placed = await _orderService.PlaceOrderAsync(order);
                await _cartService.ClearCartAsync(owner);
                TempData["OrderPlaced"] = true;
                return RedirectToAction("Details", "Orders", new { id = placed.Id });
            }
            catch (InvalidOperationException ex)
            {
                TempData["StatusMessage"] = ex.Message;
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Index));
            }
        }

        private IActionResult RedirectToLocal(string? returnUrl)
        {
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                return Redirect(returnUrl);
            return RedirectToAction(nameof(Index));
        }
    }
}
