using System;
using System.Linq;
using System.Threading.Tasks;
using EShopManager.API.Models;
using MongoDB.Driver;
using Xunit;

namespace EShopManager.API.Tests
{
    [Collection("ephemeral-mongo")]
    public class CheckoutFlowTests
    {
        private readonly MongoFixture _mongo;

        public CheckoutFlowTests(MongoFixture mongo) => _mongo = mongo;

        [Fact]
        public async Task PlaceOrder_Regular_NoDiscount_DecrementsStockAndAccumulatesSpend()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Regular Tee", 100m, 5);

            var order = new RegularOrder
            {
                UserId = "user-1",
                Items = new() { new CartItem { ProductId = product.Id!, Quantity = 2, UnitPriceSnapshot = 100m } }
            };
            var placed = await s.Orders.PlaceOrderAsync(order);

            Assert.Equal(200m, placed.TotalAmount);
            Assert.Equal(0m, placed.DiscountApplied);
            Assert.NotNull(placed.Id);
            Assert.Equal(3, (await s.Products.GetAsync(product.Id!))!.Stock);

            var membership = await s.Memberships.GetMembershipAsync("user-1");
            Assert.Equal(200m, membership.TotalSpent);
            Assert.Equal(2, membership.RewardPoints);
        }

        [Fact]
        public async Task PlaceOrder_Premium_Applies10PercentOff()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Premium Tee", 100m, 10);

            var order = new PremiumOrder
            {
                UserId = "user-1",
                Items = new() { new CartItem { ProductId = product.Id!, Quantity = 2, UnitPriceSnapshot = 100m } }
            };
            var placed = await s.Orders.PlaceOrderAsync(order);

            Assert.Equal(20m, placed.DiscountApplied);
            Assert.Equal(180m, placed.TotalAmount);
            Assert.Equal(8, (await s.Products.GetAsync(product.Id!))!.Stock);
        }

        [Fact]
        public async Task PlaceOrder_Bulk_Over10Units_Applies15PercentOff()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Bulk Tee", 10m, 50);

            var order = new BulkOrder
            {
                UserId = "user-1",
                Items = new() { new CartItem { ProductId = product.Id!, Quantity = 12, UnitPriceSnapshot = 10m } }
            };
            var placed = await s.Orders.PlaceOrderAsync(order);

            Assert.Equal(18m, placed.DiscountApplied);
            Assert.Equal(102m, placed.TotalAmount);
        }

        [Fact]
        public async Task PlaceOrder_InsufficientStock_RollsBackEverything()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var available = await s.SeedProductAsync("Available", 10m, 5);
            var scarce = await s.SeedProductAsync("Scarce", 10m, 1);

            var order = new RegularOrder
            {
                UserId = "user-1",
                Items = new()
                {
                    new CartItem { ProductId = available.Id!, Quantity = 2, UnitPriceSnapshot = 10m },
                    new CartItem { ProductId = scarce.Id!, Quantity = 3, UnitPriceSnapshot = 10m }
                }
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() => s.Orders.PlaceOrderAsync(order));

            Assert.Equal(5, (await s.Products.GetAsync(available.Id!))!.Stock);
            Assert.Equal(1, (await s.Products.GetAsync(scarce.Id!))!.Stock);

            var ordersInDb = await s.Db.GetCollection<Order>("Orders").Find(FilterDefinition<Order>.Empty).ToListAsync();
            Assert.Empty(ordersInDb);

            var membership = await s.Memberships.GetMembershipAsync("user-1");
            Assert.Equal(0m, membership.TotalSpent);
        }

        [Fact]
        public async Task FullFlow_AddToCart_Checkout_ClearsCartLikeController()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Flow Tee", 60m, 8);

            await s.Carts.AddToCartAsync("user-2", new CartItem { ProductId = product.Id!, Quantity = 2 });
            var cart = await s.Carts.GetCartAsync("user-2");

            var totalQuantity = cart!.Items.Sum(i => i.Quantity);
            Order order = totalQuantity > 10 ? new BulkOrder() : new RegularOrder();
            order.UserId = "user-2";
            order.Items = cart.Items;
            var placed = await s.Orders.PlaceOrderAsync(order);
            await s.Carts.ClearCartAsync("user-2");

            Assert.Equal(120m, placed.TotalAmount);
            Assert.Equal(6, (await s.Products.GetAsync(product.Id!))!.Stock);
            Assert.Null(await s.Carts.GetCartAsync("user-2"));

            var history = await s.Orders.GetUserOrdersAsync("user-2");
            var saved = Assert.Single(history);
            Assert.Equal("Pending", saved.Status);
        }

        [Fact]
        public async Task UpdateStatus_PersistsNewStatus()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Status Tee", 10m, 5);
            var order = new RegularOrder
            {
                UserId = "user-1",
                Items = new() { new CartItem { ProductId = product.Id!, Quantity = 1, UnitPriceSnapshot = 10m } }
            };
            var placed = await s.Orders.PlaceOrderAsync(order);

            await s.Orders.UpdateOrderStatusAsync(placed.Id!, "Shipped");

            var reloaded = await s.Orders.GetOrderAsync(placed.Id!);
            Assert.Equal("Shipped", reloaded!.Status);
        }
    }
}
