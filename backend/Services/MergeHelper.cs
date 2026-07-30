using EShopManager.API.Models;

namespace EShopManager.API.Services
{
    // Pure helper for merging carts; keeps logic testable without DB.
    public static class MergeHelper
    {
        public class MergeResult
        {
            public List<CartItem> Items { get; set; } = new();
            public List<string> Conflicts { get; set; } = new();
        }

        // Merge guest items into user items. stockByProduct maps productId->availableStock
        public static MergeResult MergeCarts(IEnumerable<CartItem> userItems, IEnumerable<CartItem> guestItems, Dictionary<string,int> stockByProduct)
        {
            var result = new MergeResult();
            var map = new Dictionary<string, CartItem>(); // key = productId|variant

            string KeyOf(CartItem c) => (c.ProductId ?? "") + "|" + (c.VariantId ?? "");

            foreach (var it in userItems)
            {
                map[KeyOf(it)] = new CartItem
                {
                    ItemId = it.ItemId,
                    ProductId = it.ProductId,
                    VariantId = it.VariantId,
                    Quantity = it.Quantity,
                    UnitPriceSnapshot = it.UnitPriceSnapshot,
                    Currency = it.Currency,
                    AddedAt = it.AddedAt
                };
            }

            foreach (var g in guestItems)
            {
                var k = KeyOf(g);
                if (map.TryGetValue(k, out var existing))
                {
                    var sum = existing.Quantity + g.Quantity;
                    var avail = stockByProduct.ContainsKey(g.ProductId) ? stockByProduct[g.ProductId] : int.MaxValue;
                    if (sum > avail)
                    {
                        existing.Quantity = avail;
                        result.Conflicts.Add($"{g.ProductId} capped to {avail}");
                    }
                    else
                    {
                        existing.Quantity = sum;
                    }

                    // prefer latest price snapshot
                    existing.UnitPriceSnapshot = g.UnitPriceSnapshot;
                }
                else
                {
                    var avail = stockByProduct.ContainsKey(g.ProductId) ? stockByProduct[g.ProductId] : int.MaxValue;
                    var toAdd = new CartItem
                    {
                        ItemId = g.ItemId,
                        ProductId = g.ProductId,
                        VariantId = g.VariantId,
                        Quantity = Math.Min(g.Quantity, avail),
                        UnitPriceSnapshot = g.UnitPriceSnapshot,
                        Currency = g.Currency,
                        AddedAt = g.AddedAt
                    };
                    if (g.Quantity > avail)
                        result.Conflicts.Add($"{g.ProductId} capped to {avail}");
                    map[k] = toAdd;
                }
            }

            result.Items = map.Values.ToList();
            return result;
        }
    }
}
