using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class OrderService
    {
        private readonly IMongoCollection<Order> _orderCollection;
        private readonly ProductService _productService;
        private readonly MembershipService _membershipService;

        public OrderService(IMongoDatabase mongoDatabase, ProductService productService, MembershipService membershipService)
        {
            _orderCollection = mongoDatabase.GetCollection<Order>("Orders");
            _productService = productService;
            _membershipService = membershipService;
        }

        public async Task<Order?> GetOrderAsync(string id) =>
            await _orderCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<Order>> GetUserOrdersAsync(string userId) =>
            await _orderCollection.Find(x => x.UserId == userId).ToListAsync();

        public async Task<Order> PlaceOrderAsync(Order order)
        {
            // Calculate base total before discount
            order.TotalAmount = order.Items.Sum(i => i.Price * i.Quantity);

            // Apply OOP polymorphism discount
            order.ApplyDiscount();

            await _orderCollection.InsertOneAsync(order);

            // Atomically decrement inventory. If any item cannot be fulfilled,
            // roll back all decrements already applied and remove the order.
            var decremented = new List<(string ProductId, int Quantity)>();
            try
            {
                foreach (var item in order.Items)
                {
                    var product = await _productService.GetAsync(item.ProductId);
                    if (product == null)
                    {
                        throw new InvalidOperationException(
                            $"Product {item.ProductId} is no longer available.");
                    }

                    var ok = await _productService.DecrementStockAsync(item.ProductId, item.Quantity);
                    if (!ok)
                    {
                        throw new InvalidOperationException(
                            $"Not enough stock for \"{product.Name}\". Only {product.Stock} available.");
                    }

                    decremented.Add((item.ProductId, item.Quantity));
                }
            }
            catch
            {
                foreach (var (productId, quantity) in decremented)
                {
                    await _productService.IncrementStockAsync(productId, quantity);
                }
                await _orderCollection.DeleteOneAsync(x => x.Id == order.Id);
                throw;
            }

            // Integrate Membership & Rewards Core
            // Accumulate spending points for the user
            await _membershipService.AccumulateSpendingAsync(order.UserId, order.TotalAmount);

            return order;
        }

        public async Task UpdateOrderStatusAsync(string id, string status)
        {
            var update = Builders<Order>.Update.Set(x => x.Status, status);
            await _orderCollection.UpdateOneAsync(x => x.Id == id, update);
        }
    }
}
