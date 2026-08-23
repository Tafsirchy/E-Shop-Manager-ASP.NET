using System;
using System.Threading.Tasks;
using EShopManager.API.Models;
using Xunit;

namespace EShopManager.API.Tests
{
    [Collection("ephemeral-mongo")]
    public class CategoryDiscountTests
    {
        private readonly MongoFixture _mongo;

        public CategoryDiscountTests(MongoFixture mongo) => _mongo = mongo;

        [Fact]
        public void Catalog_ResolvesSpecificPolicy_CaseInsensitive()
        {
            var policy = CategoryDiscountCatalog.Resolve("JACKETS");
            Assert.IsType<SpecificCategoryDiscount>(policy);
            Assert.Equal(15m, policy.Percentage);
        }

        [Fact]
        public void Catalog_UnknownCategory_FallsBackToNoDiscount()
        {
            var policy = CategoryDiscountCatalog.Resolve("nonexistent");
            Assert.Equal(0m, policy.Percentage);
        }

        [Fact]
        public async Task PlaceOrder_CategoryDiscountApplied_OnSubtotal()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var jacket = await s.SeedProductAsync("Leather Jacket", 100m, 5, "jackets");

            var order = new RegularOrder
            {
                UserId = "user-1",
                Items = new() { new CartItem { ProductId = jacket.Id!, Quantity = 2, UnitPriceSnapshot = 100m } }
            };
            var placed = await s.Orders.PlaceOrderAsync(order);

            Assert.Equal(200m, placed.Subtotal);
            Assert.Equal(30m, placed.CategoryDiscountApplied);
            Assert.Equal(0m, placed.DiscountApplied);
            Assert.Equal(170m, placed.TotalAmount);
        }

        [Fact]
        public async Task PlaceOrder_CategoryAndOrderTypeDiscounts_Stack()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var shoes = await s.SeedProductAsync("Running Shoes", 100m, 10, "shoes");

            var order = new PremiumOrder
            {
                UserId = "user-1",
                Items = new() { new CartItem { ProductId = shoes.Id!, Quantity = 2, UnitPriceSnapshot = 100m } }
            };
            var placed = await s.Orders.PlaceOrderAsync(order);

            Assert.Equal(200m, placed.Subtotal);
            Assert.Equal(20m, placed.CategoryDiscountApplied);
            Assert.Equal(18m, placed.DiscountApplied);
            Assert.Equal(162m, placed.TotalAmount);

            var membership = await s.Memberships.GetMembershipAsync("user-1");
            Assert.Equal(162m, membership.TotalSpent);
        }
    }
}
