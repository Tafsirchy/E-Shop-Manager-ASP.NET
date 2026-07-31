using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class SubscriptionService
    {
        private readonly IMongoCollection<SubscriptionPackage> _packageCollection;
        private readonly IMongoCollection<UserSubscription> _userSubCollection;

        public SubscriptionService(IMongoDatabase mongoDatabase)
        {
            _packageCollection = mongoDatabase.GetCollection<SubscriptionPackage>("SubscriptionPackages");
            _userSubCollection = mongoDatabase.GetCollection<UserSubscription>("UserSubscriptions");
        }

        // Package Management
        public async Task<List<SubscriptionPackage>> GetPackagesAsync(bool activeOnly = true)
        {
            var filter = activeOnly ? Builders<SubscriptionPackage>.Filter.Eq(x => x.IsActive, true) : Builders<SubscriptionPackage>.Filter.Empty;
            return await _packageCollection.Find(filter).ToListAsync();
        }

        public async Task<SubscriptionPackage?> GetPackageAsync(string id) =>
            await _packageCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreatePackageAsync(SubscriptionPackage package) =>
            await _packageCollection.InsertOneAsync(package);

        // Custom Package Builder Logic
        // The discount threshold is based on the user's verified lifetime spend,
        // never on client-supplied input.
        public SubscriptionPackage BuildCustomPackage(List<string> features, decimal basePricePerFeature, decimal userTotalSpent)
        {
            var totalPrice = features.Count * basePricePerFeature;
            var package = new SubscriptionPackage
            {
                Type = "Custom",
                Name = "Custom Package",
                Price = totalPrice,
                Features = features
            };

            // Dynamic threshold offer auto-apply engine
            if (userTotalSpent >= 2000) 
            {
                package.Offer = new SubscriptionOffer { Threshold = 2000, Discount = 10 }; // 10% off
                package.Price -= (package.Price * 0.10m);
            }

            return package;
        }

        // Subscription Lifecycle
        public async Task<UserSubscription> SubscribeAsync(string userId, string packageId)
        {
            var package = await GetPackageAsync(packageId);
            if (package == null) throw new Exception("Package not found");

            var subscription = new UserSubscription
            {
                UserId = userId,
                PackageId = packageId,
                NextBillingDate = package.BillingType == "Monthly" ? DateTime.UtcNow.AddMonths(1) : null
            };

            await _userSubCollection.InsertOneAsync(subscription);
            return subscription;
        }

        public async Task<UserSubscription> SubscribeCustomAsync(string userId, List<string> features, decimal userTotalSpent)
        {
            if (features == null || features.Count == 0)
                throw new Exception("Select at least one feature for a custom package.");

            var package = BuildCustomPackage(features, 500m, userTotalSpent);
            package.IsActive = true;
            await _packageCollection.InsertOneAsync(package);

            var subscription = new UserSubscription
            {
                UserId = userId,
                PackageId = package.Id!,
                NextBillingDate = package.BillingType == "Monthly" ? DateTime.UtcNow.AddMonths(1) : null
            };

            await _userSubCollection.InsertOneAsync(subscription);
            return subscription;
        }

        public async Task<List<UserSubscription>> GetUserSubscriptionsAsync(string userId) =>
            await _userSubCollection.Find(x => x.UserId == userId).ToListAsync();
    }
}
