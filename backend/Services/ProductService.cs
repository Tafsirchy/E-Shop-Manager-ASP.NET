using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class ProductService
    {
        private readonly IMongoCollection<Product> _productsCollection;

        public ProductService(IMongoDatabase mongoDatabase)
        {
            _productsCollection = mongoDatabase.GetCollection<Product>("Products");
        }

        public async Task<List<Product>> GetAsync(string? search = null, string? category = null)
        {
            var filterBuilder = Builders<Product>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrEmpty(search))
            {
                filter &= filterBuilder.Regex(x => x.Name, new MongoDB.Bson.BsonRegularExpression(search, "i"));
            }

            if (!string.IsNullOrEmpty(category))
            {
                filter &= filterBuilder.Eq(x => x.Category, category);
            }

            return await _productsCollection.Find(filter).ToListAsync();
        }

        public async Task<Product?> GetAsync(string id) =>
            await _productsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Product newProduct) =>
            await _productsCollection.InsertOneAsync(newProduct);

        public async Task UpdateAsync(string id, Product updatedProduct) =>
            await _productsCollection.ReplaceOneAsync(x => x.Id == id, updatedProduct);

        public async Task RemoveAsync(string id) =>
            await _productsCollection.DeleteOneAsync(x => x.Id == id);

        // Atomically decrement stock only if at least `quantity` is available.
        // Returns true if the decrement succeeded.
        public async Task<bool> DecrementStockAsync(string productId, int quantity)
        {
            var filter = Builders<Product>.Filter.And(
                Builders<Product>.Filter.Eq(x => x.Id, productId),
                Builders<Product>.Filter.Gte(x => x.Stock, quantity)
            );
            var update = Builders<Product>.Update.Inc(x => x.Stock, -quantity);
            var result = await _productsCollection.FindOneAndUpdateAsync(filter, update);
            return result != null;
        }

        public async Task IncrementStockAsync(string productId, int quantity)
        {
            var update = Builders<Product>.Update.Inc(x => x.Stock, quantity);
            await _productsCollection.UpdateOneAsync(x => x.Id == productId, update);
        }

        // Low stock alert logic
        public async Task<List<Product>> GetLowStockProductsAsync(int threshold = 10) =>
            await _productsCollection.Find(x => x.Stock < threshold).ToListAsync();
    }
}
