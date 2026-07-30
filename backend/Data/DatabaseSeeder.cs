using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IMongoDatabase database)
        {
            var products = database.GetCollection<Product>("Products");

            var categories = new[]
            {
                "tshirts","hoodies","jackets","pants","activewear",
                "dresses","tops","knitwear","jeans","swimwear",
                "bags","jewelry","sunglasses","hats","shoes"
            };

            var random = new Random(42);

            foreach (var category in categories)
            {
                var existingCount = (int)await products.CountDocumentsAsync(Builders<Product>.Filter.Eq(p => p.Category, category));
                if (existingCount >= 4) continue;

                var toInsert = new List<Product>();
                for (int i = existingCount + 1; i <= 4; i++)
                {
                    var prod = new Product
                    {
                        Name = GenerateProductName(category, i),
                        Description = $"High quality {category} item #{i}.",
                        Price = Math.Round((decimal)(10 + random.NextDouble() * 190), 2),
                        Stock = random.Next(20, 200),
                        Category = category,
                        ImageUrl = GetPlaceholderImageUrl(category, i),
                        CreatedAt = DateTime.UtcNow
                    };
                    toInsert.Add(prod);
                }

                if (toInsert.Count > 0)
                {
                    await products.InsertManyAsync(toInsert);
                }
            }

            // Update existing products that lack images
            foreach (var category in categories)
            {
                var filter = Builders<Product>.Filter.Eq(p => p.Category, category) & (
                    Builders<Product>.Filter.Eq(p => p.ImageUrl, null) |
                    Builders<Product>.Filter.Eq(p => p.ImageUrl, "")
                );

                var missing = await products.Find(filter).ToListAsync();
                if (missing.Count == 0) continue;

                int idx = 1;
                foreach (var prod in missing)
                {
                    prod.ImageUrl = GetPlaceholderImageUrl(category, idx);
                    await products.ReplaceOneAsync(p => p.Id == prod.Id, prod);
                    idx++;
                }
            }
        }

        private static string GenerateProductName(string category, int idx)
        {
            // Make readable names for known categories
            var niceCategory = category switch
            {
                "tshirts" => "T-Shirt",
                "hoodies" => "Hoodie",
                "jackets" => "Jacket",
                "pants" => "Pants",
                "activewear" => "Activewear",
                "dresses" => "Dress",
                "tops" => "Top",
                "knitwear" => "Knitwear",
                "jeans" => "Jeans",
                "swimwear" => "Swimwear",
                "bags" => "Bag",
                "jewelry" => "Jewelry",
                "sunglasses" => "Sunglasses",
                "hats" => "Hat",
                "shoes" => "Shoes",
                _ => category
            };

            return $"{niceCategory} {idx:00}";
        }

        private static string GetPlaceholderImageUrl(string category, int idx)
        {
            // Provide category-appropriate Unsplash images where possible
            var images = new Dictionary<string, string[]>
            {
                { "tshirts", new[] {
                    "https://images.unsplash.com/photo-1520975911092-9fc1c3be6e53",
                    "https://images.unsplash.com/photo-1520975911100-7f1d6d3f8a1a",
                    "https://images.unsplash.com/photo-1520975911107-2c6f3b3b6f1d",
                    "https://images.unsplash.com/photo-1520975911115-9b2e5f4a7c6b"
                }},
                { "hoodies", new[] {
                    "https://images.unsplash.com/photo-1602810314646-8b2b6b2e1b3b",
                    "https://images.unsplash.com/photo-1602810314653-6c3d7a9e2c4a",
                    "https://images.unsplash.com/photo-1602810314660-1f5b2a7d3d8c",
                    "https://images.unsplash.com/photo-1602810314667-5a7c9f1b2a3d"
                }},
                { "jackets", new[] {
                    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
                    "https://images.unsplash.com/photo-1445019980604-2b1d1b1a1a2b",
                    "https://images.unsplash.com/photo-1445019980611-3c2e2c2b2b3c",
                    "https://images.unsplash.com/photo-1445019980618-4d3f3d3c3c4d"
                }},
                { "pants", new[] {
                    "https://images.unsplash.com/photo-1503342452485-86f7f2a3c3b9",
                    "https://images.unsplash.com/photo-1503342452492-77e6e1b2b2a8",
                    "https://images.unsplash.com/photo-1503342452499-66d5d0a1a197",
                    "https://images.unsplash.com/photo-1503342452506-55c4c09490ee"
                }},
                { "activewear", new[] {
                    "https://images.unsplash.com/photo-1526403224744-5d3f2f2b2a1a",
                    "https://images.unsplash.com/photo-1526403224751-4c2e1e1b1a2b",
                    "https://images.unsplash.com/photo-1526403224758-3b1d0d0a0a3c",
                    "https://images.unsplash.com/photo-1526403224765-2a0c0c09090d"
                }},
                { "dresses", new[] {
                    "https://images.unsplash.com/photo-1520975911102-8f3f3c3b2a1a",
                    "https://images.unsplash.com/photo-1520975911109-7e2e2b2a1919",
                    "https://images.unsplash.com/photo-1520975911116-6d1d1a191818",
                    "https://images.unsplash.com/photo-1520975911123-5c0c09080707"
                }},
                { "tops", new[] {
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
                    "https://images.unsplash.com/photo-1541099649106-e1d2b2a5c7f3",
                    "https://images.unsplash.com/photo-1541099649107-d3c4b5a6e8f2",
                    "https://images.unsplash.com/photo-1541099649108-c2b3a4d5e6f1"
                }},
                { "knitwear", new[] {
                    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
                    "https://images.unsplash.com/photo-1512436991642-5634cdb1622e",
                    "https://images.unsplash.com/photo-1512436991643-4523bca1521d",
                    "https://images.unsplash.com/photo-1512436991644-3412ab94210c"
                }},
                { "jeans", new[] {
                    "https://images.unsplash.com/photo-1514996937319-344454492b37",
                    "https://images.unsplash.com/photo-1514996937320-233443582b36",
                    "https://images.unsplash.com/photo-1514996937321-122332472b35",
                    "https://images.unsplash.com/photo-1514996937322-011221362b34"
                }},
                { "swimwear", new[] {
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                    "https://images.unsplash.com/photo-1507525428035-a623bf961c3d",
                    "https://images.unsplash.com/photo-1507525428036-9521af961b2c",
                    "https://images.unsplash.com/photo-1507525428037-8420af961a1b"
                }},
                { "bags", new[] {
                    "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f",
                    "https://images.unsplash.com/photo-1519744792096-1e1104d76b5e",
                    "https://images.unsplash.com/photo-1519744792097-0d0003c65b4d",
                    "https://images.unsplash.com/photo-1519744792098-ff0012b54a3c"
                }},
                { "jewelry", new[] {
                    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
                    "https://images.unsplash.com/photo-1522312346376-c2b42d1b88a2",
                    "https://images.unsplash.com/photo-1522312346377-b3c31c0a77a1",
                    "https://images.unsplash.com/photo-1522312346378-a4d20bfa6610"
                }},
                { "sunglasses", new[] {
                    "https://images.unsplash.com/photo-1504198453319-5ce911bafcde",
                    "https://images.unsplash.com/photo-1504198453320-4b4a0ac8ffbd",
                    "https://images.unsplash.com/photo-1504198453321-3a3949b7df9a",
                    "https://images.unsplash.com/photo-1504198453322-2a2838a6cf89"
                }},
                { "hats", new[] {
                    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
                    "https://images.unsplash.com/photo-1499951360448-a19ae7ee70f6",
                    "https://images.unsplash.com/photo-1499951360449-9199b6dd6f07",
                    "https://images.unsplash.com/photo-1499951360450-8198a5cc5e08"
                }},
                { "shoes", new[] {
                    "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
                    "https://images.unsplash.com/photo-1491553895912-1144eca6402e",
                    "https://images.unsplash.com/photo-1491553895913-2233eca6402f",
                    "https://images.unsplash.com/photo-1491553895914-3322eca64030"
                }}
            };

            if (images.TryGetValue(category, out var arr))
            {
                var index = (idx - 1) % arr.Length;
                return arr[index] + "?auto=format&fit=crop&w=800&q=80";
            }

            // Fallback to deterministic picsum
            var seed = Math.Abs((category + idx).GetHashCode()) % 1000;
            return $"https://picsum.photos/seed/{seed}/800/800";
        }
    }
}
