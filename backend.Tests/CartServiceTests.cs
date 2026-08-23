using System;
using System.Linq;
using System.Threading.Tasks;
using EShopManager.API.Models;
using Xunit;

namespace EShopManager.API.Tests
{
    [Collection("ephemeral-mongo")]
    public class CartServiceTests
    {
        private readonly MongoFixture _mongo;

        public CartServiceTests(MongoFixture mongo) => _mongo = mongo;

        [Fact]
        public async Task Add_NewProduct_CreatesCartWithSnapshotPrice()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Snapshot Tee", 25m, 10);

            var result = await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 2 });

            Assert.True(result.Success);
            var cart = await s.Carts.GetCartAsync("user-1");
            Assert.NotNull(cart);
            var line = Assert.Single(cart!.Items);
            Assert.Equal(2, line.Quantity);
            Assert.Equal(25m, line.UnitPriceSnapshot);
            Assert.Equal(1, cart.Version);
        }

        [Fact]
        public async Task Add_SameLineTwice_IncrementsQuantityAndBumpsVersion()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Repeat Tee", 10m, 10);

            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });
            var result = await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });

            Assert.True(result.Success);
            var cart = await s.Carts.GetCartAsync("user-1");
            var line = Assert.Single(cart!.Items);
            Assert.Equal(2, line.Quantity);
            Assert.Equal(2, cart.Version);
        }

        [Fact]
        public async Task Add_ExceedingStock_FailsAndReportsAvailable()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Scarce Tee", 10m, 3);

            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 2 });
            var result = await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 2 });

            Assert.False(result.Success);
            Assert.Equal(3, result.Available);
            var cart = await s.Carts.GetCartAsync("user-1");
            Assert.Equal(2, cart!.Items.Single().Quantity);
        }

        [Fact]
        public async Task Add_UnknownProduct_Fails()
        {
            var s = TestStack.For(_mongo.CreateDatabase());

            var result = await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = "000000000000000000000000", Quantity = 1 });

            Assert.False(result.Success);
            Assert.Null(await s.Carts.GetCartAsync("user-1"));
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-5)]
        public async Task UpdateQuantity_BelowOne_Fails(int quantity)
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Qty Tee", 10m, 10);
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });
            var itemId = (await s.Carts.GetCartAsync("user-1"))!.Items[0].ItemId;

            var result = await s.Carts.UpdateQuantityAsync("user-1", itemId, quantity);

            Assert.False(result.Success);
        }

        [Fact]
        public async Task UpdateQuantity_UnknownItem_Fails()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Lonely Tee", 10m, 10);
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });

            var result = await s.Carts.UpdateQuantityAsync("user-1", "no-such-item", 2);

            Assert.False(result.Success);
        }

        [Fact]
        public async Task UpdateQuantity_AboveStock_FailsAndReportsAvailable()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Capped Tee", 10m, 4);
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });
            var itemId = (await s.Carts.GetCartAsync("user-1"))!.Items[0].ItemId;

            var result = await s.Carts.UpdateQuantityAsync("user-1", itemId, 99);

            Assert.False(result.Success);
            Assert.Equal(4, result.Available);
        }

        [Fact]
        public async Task UpdateQuantity_HappyPath_SetsQuantityAndBumpsVersion()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Editable Tee", 10m, 10);
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });
            var itemId = (await s.Carts.GetCartAsync("user-1"))!.Items[0].ItemId;

            var result = await s.Carts.UpdateQuantityAsync("user-1", itemId, 7);

            Assert.True(result.Success);
            var cart = await s.Carts.GetCartAsync("user-1");
            Assert.Equal(7, cart!.Items[0].Quantity);
            Assert.Equal(2, cart.Version);
        }

        [Fact]
        public async void Remove_ByItemId_RemovesOnlyThatLine()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var p1 = await s.SeedProductAsync("First", 10m, 10);
            var p2 = await s.SeedProductAsync("Second", 20m, 10);
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = p1.Id!, Quantity = 1 });
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = p2.Id!, Quantity = 1 });
            var target = (await s.Carts.GetCartAsync("user-1"))!.Items.First(i => i.ProductId == p1.Id);

            await s.Carts.RemoveFromCartAsync("user-1", target.ItemId);

            var cart = await s.Carts.GetCartAsync("user-1");
            var remaining = Assert.Single(cart!.Items);
            Assert.Equal(p2.Id, remaining.ProductId);
        }

        [Fact]
        public async Task Clear_RemovesEntireCart()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Doomed Tee", 10m, 10);
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });

            await s.Carts.ClearCartAsync("user-1");

            Assert.Null(await s.Carts.GetCartAsync("user-1"));
        }

        [Fact]
        public async Task MergeGuest_MergesIntoUserCart_AndDeletesGuestCart()
        {
            var s = TestStack.For(_mongo.CreateDatabase());
            var product = await s.SeedProductAsync("Merged Tee", 15m, 10);
            await s.Carts.AddToCartAsync("guest-1", new CartItem { ProductId = product.Id!, Quantity = 2 });
            await s.Carts.AddToCartAsync("user-1", new CartItem { ProductId = product.Id!, Quantity = 1 });

            var mergeResult = await s.Carts.MergeGuestIntoUserAsync("guest-1", "user-1");

            Assert.Empty(mergeResult.Conflicts);
            var userCart = await s.Carts.GetCartAsync("user-1");
            var line = Assert.Single(userCart!.Items);
            Assert.Equal(3, line.Quantity);
            Assert.Null(await s.Carts.GetCartAsync("guest-1"));
        }
    }
}
