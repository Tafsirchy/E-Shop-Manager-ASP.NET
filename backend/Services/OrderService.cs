using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class OrderService
    {
        private readonly IMongoCollection<Order> _orderCollection;

        public OrderService(IMongoDatabase mongoDatabase)
        {
            _orderCollection = mongoDatabase.GetCollection<Order>("Orders");
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
            return order;
        }

        public async Task UpdateOrderStatusAsync(string id, string status)
        {
            var update = Builders<Order>.Update.Set(x => x.Status, status);
            await _orderCollection.UpdateOneAsync(x => x.Id == id, update);
        }
    }
}
