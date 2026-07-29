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
            
        // Low stock alert logic
        public async Task<List<Product>> GetLowStockProductsAsync(int threshold = 10) =>
            await _productsCollection.Find(x => x.Stock < threshold).ToListAsync();
    }
}
