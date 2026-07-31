using System.Collections.Generic;
using System.Linq;
using EShopManager.API.Services;
using EShopManager.API.Models;
using Xunit;

namespace EShopManager.API.Tests
{
    public class MergeHelperTests
    {
        [Fact]
        public void MergeCarts_CapsAtStockAndReportsConflicts()
        {
            var userItems = new List<CartItem>
            {
                new CartItem { ItemId = "u1", ProductId = "p1", VariantId = "v1", Quantity = 1, UnitPriceSnapshot = 10m, Currency = "USD" }
            };

            var guestItems = new List<CartItem>
            {
                new CartItem { ItemId = "g1", ProductId = "p1", VariantId = "v1", Quantity = 5, UnitPriceSnapshot = 9m, Currency = "USD" },
                new CartItem { ItemId = "g2", ProductId = "p2", VariantId = null, Quantity = 2, UnitPriceSnapshot = 20m, Currency = "USD" }
            };

            var stock = new Dictionary<string,int> { { "p1", 4 }, { "p2", 10 } };

            var res = MergeHelper.MergeCarts(userItems, guestItems, stock);

            // p1: user 1 + guest 5 => capped to 4
            var p1 = res.Items.FirstOrDefault(i => i.ProductId == "p1");
            Assert.NotNull(p1);
            Assert.Equal(4, p1.Quantity);

            // p2: added as-is
            var p2 = res.Items.FirstOrDefault(i => i.ProductId == "p2");
            Assert.NotNull(p2);
            Assert.Equal(2, p2.Quantity);

            Assert.Contains(res.Conflicts, c => c.Contains("p1"));
        }
    }
}
