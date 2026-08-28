using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class CartService
    {
        private readonly IMongoCollection<Cart> _cartCollection;
        private readonly ProductService _productService;

        public CartService(IMongoDatabase mongoDatabase, ProductService productService)
        {
            _cartCollection = mongoDatabase.GetCollection<Cart>("Carts");
            _productService = productService;
        }

        public async Task<Cart?> GetCartAsync(string userId) =>
            await _cartCollection.Find(x => x.UserId == userId).FirstOrDefaultAsync();

        public async Task<CartOperationResult> AddToCartAsync(string userId, CartItem item)
        {
            // Validate product and stock
            var product = await _productService.GetAsync(item.ProductId);
            if (product == null)
            {
                return new CartOperationResult { Success = false, Message = "Product not found" };
            }

            var cart = await GetCartAsync(userId);

            int existingQty = 0;
            if (cart != null)
            {
                var existingItem = cart.Items.FirstOrDefault(x => x.ProductId == item.ProductId && x.VariantId == item.VariantId);
                if (existingItem != null) existingQty = existingItem.Quantity;
            }

            var requestedTotal = existingQty + item.Quantity;
            if (requestedTotal > product.Stock)
            {
                return new CartOperationResult
                {
                    Success = false,
                    Message = "Requested quantity exceeds available stock.",
                    Available = product.Stock
                };
            }

            // set snapshot price if not provided
            if (item.UnitPriceSnapshot == 0) item.UnitPriceSnapshot = product.Price;

            if (cart == null)
            {
                cart = new Cart { UserId = userId, Items = new List<CartItem> { item }, Version = 1 };
                await _cartCollection.InsertOneAsync(cart);
            }
            else
            {
                var currentVersion = cart.Version;

                var existingItem = cart.Items.FirstOrDefault(x => x.ProductId == item.ProductId && x.VariantId == item.VariantId);
                if (existingItem != null)
                {
                    existingItem.Quantity += item.Quantity;
                    existingItem.UnitPriceSnapshot = item.UnitPriceSnapshot;
                }
                else
                {
                    cart.Items.Add(item);
                }

                cart.UpdatedAt = DateTime.UtcNow;
                cart.Version = currentVersion + 1;

                var filter = Builders<Cart>.Filter.And(
                    Builders<Cart>.Filter.Eq(x => x.Id, cart.Id),
                    Builders<Cart>.Filter.Eq(x => x.Version, currentVersion)
                );

                var result = await _cartCollection.ReplaceOneAsync(filter, cart);
                if (result.ModifiedCount == 0)
                {
                    return new CartOperationResult { Success = false, Message = "StaleCart" };
                }
            }

            return new CartOperationResult { Success = true, Payload = cart };
        }

        public async Task RemoveFromCartAsync(string userId, string productId, string? variantId = null)
        {
            var cart = await GetCartAsync(userId);
            if (cart != null)
            {
                // attempt a versioned replace; if conflict, retry once against latest
                var attempt = 0;
                while (attempt < 2)
                {
                    var currentVersion = cart.Version;
                    cart.Items.RemoveAll(x =>
                        x.ItemId == productId || // allow removing by cart ItemId
                        (x.ProductId == productId && (variantId == null || x.VariantId == variantId)));
                    cart.UpdatedAt = DateTime.UtcNow;
                    cart.Version = currentVersion + 1;

                    var filter = Builders<Cart>.Filter.And(
                        Builders<Cart>.Filter.Eq(x => x.Id, cart.Id),
                        Builders<Cart>.Filter.Eq(x => x.Version, currentVersion)
                    );

                    var res = await _cartCollection.ReplaceOneAsync(filter, cart);
                    if (res.ModifiedCount > 0) break;

                    // conflict: reload and retry
                    cart = await GetCartAsync(userId);
                    if (cart == null) break;
                    attempt++;
                }
            }
        }

        public async Task<CartOperationResult> UpdateQuantityAsync(string userId, string itemId, int newQuantity)
        {
            if (newQuantity < 1) return new CartOperationResult { Success = false, Message = "Quantity must be at least 1." };

            var cart = await GetCartAsync(userId);
            if (cart == null) return new CartOperationResult { Success = false, Message = "Cart not found." };

            var item = cart.Items.FirstOrDefault(x => x.ItemId == itemId);
            if (item == null) return new CartOperationResult { Success = false, Message = "Item not found in cart." };

            var product = await _productService.GetAsync(item.ProductId);
            if (product == null) return new CartOperationResult { Success = false, Message = "Product not found." };

            if (newQuantity > product.Stock)
            {
                return new CartOperationResult
                {
                    Success = false,
                    Message = "Requested quantity exceeds available stock.",
                    Available = product.Stock
                };
            }

            var attempt = 0;
            while (attempt < 3)
            {
                var currentVersion = cart.Version;
                item.Quantity = newQuantity;
                cart.UpdatedAt = DateTime.UtcNow;
                cart.Version = currentVersion + 1;

                var filter = Builders<Cart>.Filter.And(
                    Builders<Cart>.Filter.Eq(x => x.Id, cart.Id),
                    Builders<Cart>.Filter.Eq(x => x.Version, currentVersion)
                );

                var res = await _cartCollection.ReplaceOneAsync(filter, cart);
                if (res.ModifiedCount > 0) return new CartOperationResult { Success = true, Payload = cart };

                cart = await GetCartAsync(userId);
                if (cart == null) return new CartOperationResult { Success = false, Message = "Cart not found." };
                item = cart.Items.FirstOrDefault(x => x.ItemId == itemId);
                if (item == null) return new CartOperationResult { Success = false, Message = "Item not found in cart." };
                attempt++;
            }

            return new CartOperationResult { Success = false, Message = "StaleCart" };
        }

        public async Task ClearCartAsync(string userId)
        {
            await _cartCollection.DeleteOneAsync(x => x.UserId == userId);
        }

        public async Task<CartOperationResult> ApplyCouponAsync(string userId, string? couponCode, decimal? discount)
        {
            if (string.IsNullOrWhiteSpace(couponCode) || discount == null)
                return new CartOperationResult { Success = false, Message = "Unknown or expired coupon code." };

            var cart = await GetCartAsync(userId);
            if (cart == null || !cart.Items.Any())
                return new CartOperationResult { Success = false, Message = "Your cart is empty." };

            var attempt = 0;
            while (attempt < 3)
            {
                var currentVersion = cart.Version;
                cart.AppliedCouponCode = couponCode.Trim().ToUpper();
                cart.UpdatedAt = DateTime.UtcNow;
                cart.Version = currentVersion + 1;

                var filter = Builders<Cart>.Filter.And(
                    Builders<Cart>.Filter.Eq(x => x.Id, cart.Id),
                    Builders<Cart>.Filter.Eq(x => x.Version, currentVersion)
                );

                var res = await _cartCollection.ReplaceOneAsync(filter, cart);
                if (res.ModifiedCount > 0) return new CartOperationResult { Success = true, Payload = cart };

                cart = await GetCartAsync(userId);
                if (cart == null || !cart.Items.Any())
                    return new CartOperationResult { Success = false, Message = "Your cart is empty." };
                attempt++;
            }

            return new CartOperationResult { Success = false, Message = "StaleCart" };
        }

        public async Task RemoveCouponAsync(string userId)
        {
            var cart = await GetCartAsync(userId);
            if (cart == null) return;

            var attempt = 0;
            while (attempt < 3)
            {
                var currentVersion = cart.Version;
                cart.AppliedCouponCode = null;
                cart.UpdatedAt = DateTime.UtcNow;
                cart.Version = currentVersion + 1;

                var filter = Builders<Cart>.Filter.And(
                    Builders<Cart>.Filter.Eq(x => x.Id, cart.Id),
                    Builders<Cart>.Filter.Eq(x => x.Version, currentVersion)
                );

                var res = await _cartCollection.ReplaceOneAsync(filter, cart);
                if (res.ModifiedCount > 0) return;

                cart = await GetCartAsync(userId);
                if (cart == null) return;
                attempt++;
            }
        }

        public async Task<MergeHelper.MergeResult> MergeGuestIntoUserAsync(string guestSessionId, string userId)
        {
            var guestCart = await GetCartAsync(guestSessionId);
            if (guestCart == null) return new MergeHelper.MergeResult { Items = new List<CartItem>() };

            var userCart = await GetCartAsync(userId);
            var userItems = userCart?.Items ?? new List<CartItem>();
            var guestItems = guestCart.Items ?? new List<CartItem>();

            // Build stock map by querying products
            var productIds = userItems.Select(i => i.ProductId).Concat(guestItems.Select(i => i.ProductId)).Distinct();
            var stockMap = new Dictionary<string, int>();
            foreach (var pid in productIds)
            {
                var prod = await _productService.GetAsync(pid);
                if (prod != null) stockMap[pid] = prod.Stock;
            }

            var mergeRes = MergeHelper.MergeCarts(userItems, guestItems, stockMap);

            // Persist merged cart as user's cart with versioning and simple retry
            var mergedCart = userCart ?? new Cart { UserId = userId };
            mergedCart.Items = mergeRes.Items;
            mergedCart.UpdatedAt = DateTime.UtcNow;

            if (userCart == null)
            {
                mergedCart.Version = 1;
                await _cartCollection.InsertOneAsync(mergedCart);
            }
            else
            {
                var attempts = 0;
                var success = false;
                while (attempts < 3 && !success)
                {
                    var currentVersion = userCart.Version;
                    mergedCart.Version = currentVersion + 1;
                    var filter = Builders<Cart>.Filter.And(
                        Builders<Cart>.Filter.Eq(x => x.Id, mergedCart.Id),
                        Builders<Cart>.Filter.Eq(x => x.Version, currentVersion)
                    );
                    var res = await _cartCollection.ReplaceOneAsync(filter, mergedCart);
                    if (res.ModifiedCount > 0) success = true;
                    else
                    {
                        attempts++;
                        userCart = await GetCartAsync(userId);
                        if (userCart == null) break;
                        mergedCart = userCart;
                        mergedCart.Items = mergeRes.Items;
                    }
                }
            }

            // delete guest cart
            await _cartCollection.DeleteOneAsync(x => x.UserId == guestSessionId);

            return mergeRes;
        }
    }
}
