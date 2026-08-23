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
            // Prefetch products once: used for category discounts and stock checks
            var productsById = new Dictionary<string, Product?>();
            foreach (var item in order.Items)
            {
                if (!productsById.ContainsKey(item.ProductId))
                    productsById[item.ProductId] = await _productService.GetAsync(item.ProductId);
            }

            // Subtotal before any discounts
            order.Subtotal = Math.Round(order.Items.Sum(i => i.Price * i.Quantity), 2);

            // Category-wise discount rules (polymorphic per-category policies)
            order.CategoryDiscountApplied = Math.Round(order.Items.Sum(i =>
            {
                var lineTotal = i.Price * i.Quantity;
                var product = productsById.TryGetValue(i.ProductId, out var p) ? p : null;
                var policy = product == null
                    ? NoCategoryDiscount.Instance
                    : CategoryDiscountCatalog.Resolve(product.Category);
                return policy.DiscountFor(lineTotal);
            }), 2);

            // Base total after category discounts
            order.TotalAmount = order.Subtotal - order.CategoryDiscountApplied;

            // Order-type-wise discount (Regular / Premium / Bulk override)
            order.ApplyDiscount();

            await _orderCollection.InsertOneAsync(order);

            // Atomically decrement inventory. If any item cannot be fulfilled,
            // roll back all decrements already applied and remove the order.
            var decremented = new List<(string ProductId, int Quantity)>();
            try
            {
                foreach (var item in order.Items)
                {
                    var product = productsById[item.ProductId];
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
