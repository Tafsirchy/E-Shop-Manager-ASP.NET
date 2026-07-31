using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class MembershipService
    {
        private readonly IMongoCollection<UserMembership> _membershipCollection;
        private readonly IMongoCollection<Coupon> _couponCollection;
        private readonly UserService _userService;

        public MembershipService(IMongoDatabase database, UserService userService)
        {
            _membershipCollection = database.GetCollection<UserMembership>("UserMemberships");
            _couponCollection = database.GetCollection<Coupon>("Coupons");
            _userService = userService;
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
                // Keep the User record in sync so freshly-issued JWTs carry the new role.
                await _userService.UpdateRoleAsync(userId, "Premium");
            }

            await _membershipCollection.ReplaceOneAsync(x => x.Id == mem.Id, mem);
        }

        public async Task<string?> ClaimCouponAsync(string userId, string couponCode)
        {
            var coupon = await _couponCollection.Find(x => x.Code == couponCode).FirstOrDefaultAsync();
            if (coupon == null) return "Coupon code not found";

            var mem = await GetMembershipAsync(userId);
            if (mem.RewardPoints >= coupon.RequiredPoints)
            {
                mem.RewardPoints -= coupon.RequiredPoints;
                await _membershipCollection.ReplaceOneAsync(x => x.Id == mem.Id, mem);
                return null;
            }
            return "Insufficient reward points for this coupon";
        }
        
        // Admin method to create coupons
        public async Task CreateCouponAsync(Coupon coupon)
        {
            await _couponCollection.InsertOneAsync(coupon);
        }
    }
}
