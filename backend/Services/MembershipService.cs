using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class MembershipService
    {
        private readonly IMongoCollection<UserMembership> _membershipCollection;
        private readonly IMongoCollection<Coupon> _couponCollection;

        public MembershipService(IMongoDatabase database)
        {
            _membershipCollection = database.GetCollection<UserMembership>("UserMemberships");
            _couponCollection = database.GetCollection<Coupon>("Coupons");
        }

        public async Task<UserMembership> GetMembershipAsync(string userId)
        {
            var membership = await _membershipCollection.Find(x => x.UserId == userId).FirstOrDefaultAsync();
            if (membership == null)
            {
                membership = new UserMembership { UserId = userId };
                await _membershipCollection.InsertOneAsync(membership);
            }
            return membership;
        }

        public async Task AccumulateSpendingAsync(string userId, decimal amount)
        {
            var mem = await GetMembershipAsync(userId);
            mem.TotalSpent += amount;
            
            // Accumulate reward points (1 point per 100 BDT spent)
            mem.RewardPoints += (int)(amount / 100);

            // Role Upgradation logic: upgrade to premium if total spent exceeds 50,000
            if (mem.TotalSpent >= 50000 && mem.CurrentRole == "Regular")
            {
                mem.CurrentRole = "Premium";
                // Membership tier deliberately stays OUT of UserRole (Customer|Admin):
                // checkout reads the tier from this collection, not from auth claims.
                // (Writing "Premium" into the enum-typed Role here silently reset it
                // to Customer and would have demoted admins who placed large orders.)
            }

            await _membershipCollection.ReplaceOneAsync(x => x.Id == mem.Id, mem);
        }

        public async Task<string?> ClaimCouponAsync(string userId, string couponCode)
        {
            var coupon = await _couponCollection.Find(x => x.Code == couponCode).FirstOrDefaultAsync();
            if (coupon == null) return "Coupon code not found";

            var mem = await GetMembershipAsync(userId);
            var alreadyClaimed = mem.ClaimedCoupons.Any(c => c.Code == coupon.Code && c.Status != "Used");
            if (alreadyClaimed) return "Coupon already claimed";

            if (mem.RewardPoints >= coupon.RequiredPoints)
            {
                mem.RewardPoints -= coupon.RequiredPoints;
                mem.ClaimedCoupons.Add(new ClaimedCoupon
                {
                    Code = coupon.Code,
                    DiscountValue = coupon.DiscountValue,
                    RequiredPoints = coupon.RequiredPoints,
                    ClaimedAt = DateTime.UtcNow,
                    Status = "Active"
                });
                await _membershipCollection.ReplaceOneAsync(x => x.Id == mem.Id, mem);
                return null;
            }
            return "Insufficient reward points for this coupon";
        }

        // Returns the discount for a claimed (active) coupon belonging to the user, or null if it
        // hasn't been claimed / is no longer active.
        public async Task<decimal?> ResolveClaimedCouponAsync(string userId, string couponCode)
        {
            var mem = await GetMembershipAsync(userId);
            var claimed = mem.ClaimedCoupons.FirstOrDefault(c =>
                c.Code == couponCode && c.Status == "Active");
            return claimed?.DiscountValue;
        }

        // Marks a claimed coupon as used (consumed) once it is redeemed against an order.
        public async Task MarkCouponUsedAsync(string userId, string couponCode)
        {
            var mem = await GetMembershipAsync(userId);
            var claimed = mem.ClaimedCoupons.FirstOrDefault(c =>
                c.Code == couponCode && c.Status == "Active");
            if (claimed == null) return;
            claimed.Status = "Used";
            await _membershipCollection.ReplaceOneAsync(x => x.Id == mem.Id, mem);
        }
        
        // Admin method to create coupons
        public async Task CreateCouponAsync(Coupon coupon)
        {
            await _couponCollection.InsertOneAsync(coupon);
        }

        public async Task<List<Coupon>> GetAllCouponsAsync() =>
            await _couponCollection.Find(Builders<Coupon>.Filter.Empty).ToListAsync();

        public async Task<Coupon?> GetCouponAsync(string id) =>
            await _couponCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task UpdateCouponAsync(Coupon coupon) =>
            await _couponCollection.ReplaceOneAsync(x => x.Id == coupon.Id, coupon);

        public async Task DeleteCouponAsync(string id) =>
            await _couponCollection.DeleteOneAsync(x => x.Id == id);
    }
}
