using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class AdminAnalyticsService
    {
        private readonly IMongoCollection<Order> _orders;
        private readonly IMongoCollection<User> _users;
        private readonly IMongoCollection<Product> _products;

        public AdminAnalyticsService(IMongoDatabase db)
        {
            _orders = db.GetCollection<Order>("Orders");
            _users = db.GetCollection<User>("Customers");
            _products = db.GetCollection<Product>("Products");
        }

        public async Task<object> GetDashboardStatsAsync()
        {
            var totalUsers = await _users.CountDocumentsAsync(Builders<User>.Filter.Empty);
            
            var allOrders = await _orders.Find(Builders<Order>.Filter.Empty).ToListAsync();
            var totalRevenue = allOrders.Sum(x => x.TotalAmount);
            var totalOrders = allOrders.Count;
            
            var lowStockCount = await _products.CountDocumentsAsync(Builders<Product>.Filter.Lt(x => x.Stock, 10));

            var recentOrders = allOrders
                .OrderByDescending(x => x.CreatedAt)
                .Take(5)
                .ToList();

            return new
            {
                TotalUsers = totalUsers,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                LowStockCount = lowStockCount,
                RecentOrders = recentOrders
            };
        }
    }
}
