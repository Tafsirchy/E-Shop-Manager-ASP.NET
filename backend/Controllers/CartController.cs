using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace EShopManager.API.Controllers
{
    public class CartController : Controller
    {
        private readonly CartService _cartService;
        private readonly EShopManager.API.Services.ProductService _productService;
        private readonly OrderService _orderService;
        private readonly MembershipService _membershipService;
        private readonly CurrentUser _me;

        public CartController(CartService cartService, EShopManager.API.Services.ProductService productService,
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

        [HttpGet]
        public async Task<IActionResult> Count()
        {
            var cart = await _cartService.GetCartAsync(_me.OwnerKey);
            return Json(new { count = cart?.Items.Sum(i => i.Quantity) ?? 0 });
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
                // Place the order in the database (defaults to "Pending" status)
                var placed = await _orderService.PlaceOrderAsync(order);

                // Setup Stripe Checkout
                var domain = $"{Request.Scheme}://{Request.Host}";
                var options = new Stripe.Checkout.SessionCreateOptions
                {
                    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
                    {
                        new Stripe.Checkout.SessionLineItemOptions
                        {
                            PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                            {
                                UnitAmount = (long)(placed.TotalAmount * 100),
                                Currency = "bdt",
                                ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = $"E-Shop Order #{placed.Id?[..8]}",
                                },
                            },
                            Quantity = 1,
                        },
                    },
                    Mode = "payment",
                    SuccessUrl = domain + Url.Action("PaymentSuccess", "Cart", new { orderId = placed.Id }),
                    CancelUrl = domain + Url.Action("PaymentCancel", "Cart", new { orderId = placed.Id }),
                };

                var service = new Stripe.Checkout.SessionService();
                var session = service.Create(options);

                return Redirect(session.Url);
            }
            catch (Exception ex)
            {
                TempData["StatusMessage"] = ex.Message;
                TempData["StatusIsError"] = true;
                return RedirectToAction(nameof(Index));
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> PaymentSuccess(string orderId)
        {
            var owner = _me.Email;
            
            // Mark order as paid/processing
            await _orderService.UpdateOrderStatusAsync(orderId, "Processing");
            
            // Clear the cart only upon successful payment
            await _cartService.ClearCartAsync(owner);

            TempData["OrderPlaced"] = true;
            return RedirectToAction("Details", "Orders", new { id = orderId });
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> PaymentCancel(string orderId)
        {
            // Optionally, mark the order as cancelled or leave it pending
            await _orderService.UpdateOrderStatusAsync(orderId, "Cancelled");
            
            TempData["StatusMessage"] = "Payment was cancelled. Order has been marked as Cancelled.";
            TempData["StatusIsError"] = true;
            return RedirectToAction(nameof(Index));
        }

        private IActionResult RedirectToLocal(string? returnUrl)
        {
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                return Redirect(returnUrl);
            return RedirectToAction(nameof(Index));
        }
    }
}
