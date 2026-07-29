using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class CartService
    {
        private readonly IMongoCollection<Cart> _cartCollection;

        public CartService(IMongoDatabase mongoDatabase)
        {
            _cartCollection = mongoDatabase.GetCollection<Cart>("Carts");
        }

        public async Task<Cart?> GetCartAsync(string userId) =>
            await _cartCollection.Find(x => x.UserId == userId).FirstOrDefaultAsync();

        public async Task AddToCartAsync(string userId, CartItem item)
        {
            var cart = await GetCartAsync(userId);
            if (cart == null)
            {
                cart = new Cart { UserId = userId, Items = new List<CartItem> { item } };
                await _cartCollection.InsertOneAsync(cart);
            }
            else
            {
                var existingItem = cart.Items.FirstOrDefault(x => x.ProductId == item.ProductId);
                if (existingItem != null)
                {
                    existingItem.Quantity += item.Quantity;
                }
                else
                {
                    cart.Items.Add(item);
                }
                cart.UpdatedAt = DateTime.UtcNow;
                await _cartCollection.ReplaceOneAsync(x => x.Id == cart.Id, cart);
            }
        }

        public async Task RemoveFromCartAsync(string userId, string productId)
        {
            var cart = await GetCartAsync(userId);
            if (cart != null)
            {
                cart.Items.RemoveAll(x => x.ProductId == productId);
                cart.UpdatedAt = DateTime.UtcNow;
                await _cartCollection.ReplaceOneAsync(x => x.Id == cart.Id, cart);
            }
        }

        public async Task ClearCartAsync(string userId)
        {
            await _cartCollection.DeleteOneAsync(x => x.UserId == userId);
        }
    }
}
