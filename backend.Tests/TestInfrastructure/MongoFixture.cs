using System;
using System.Threading.Tasks;
using EShopManager.API.Models;
using EShopManager.API.Services;
using EphemeralMongo;
using MongoDB.Driver;
using Xunit;

namespace EShopManager.API.Tests
{
    public class MongoFixture : IDisposable
    {
        private readonly IMongoRunner _runner;
        private readonly MongoClient _client;

        public MongoFixture()
        {
            _runner = MongoRunner.Run();
            _client = new MongoClient(_runner.ConnectionString);
        }

        public IMongoDatabase CreateDatabase() =>
            _client.GetDatabase("eshop_test_" + Guid.NewGuid().ToString("N"));

        public void Dispose() => _runner.Dispose();
    }

    [CollectionDefinition("ephemeral-mongo")]
    public class MongoCollection : ICollectionFixture<MongoFixture>
    {
    }

    public static class TestStack
    {
        public sealed class Stack
        {
            public IMongoDatabase Db { get; }
            public ProductService Products { get; }
            public CartService Carts { get; }
            public OrderService Orders { get; }
            public MembershipService Memberships { get; }

            public Stack(IMongoDatabase db)
            {
                Db = db;
                Products = new ProductService(db);
                Carts = new CartService(db, Products);
                Memberships = new MembershipService(db);
                Orders = new OrderService(db, Products, Memberships);
            }

            public async Task<Product> SeedProductAsync(string name, decimal price, int stock, string category = "tshirts")
            {
                var product = new Product
                {
                    Name = name,
                    Category = category,
                    Price = price,
                    Stock = stock,
                    Sku = "SKU-" + Guid.NewGuid().ToString("N")[..8]
                };
                await Products.CreateAsync(product);
                return product;
            }
        }

        public static Stack For(IMongoDatabase db) => new(db);
    }
}
