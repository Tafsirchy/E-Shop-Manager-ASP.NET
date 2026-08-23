using EShopManager.API.Models;

namespace EShopManager.API.ViewModels
{
    public class MembershipIndexViewModel
    {
        public UserMembership Membership { get; set; } = null!;
    }

    public class ClaimCouponInput
    {
        public string Code { get; set; } = null!;
    }

    public class SubscriptionPackageRow
    {
        public SubscriptionPackage Package { get; set; } = null!;
        public bool IsSubscribed { get; set; }
    }

    public class SubscriptionsIndexViewModel
    {
        public List<SubscriptionPackageRow> Packages { get; set; } = new();
        public List<string> AvailableFeatures { get; set; } = new();
        public List<UserSubscription> MySubscriptions { get; set; } = new();
        public Dictionary<string, SubscriptionPackage> PackageLookup { get; set; } = new();
        public SubscriptionPackage? Quote { get; set; }
        public List<string> QuotedFeatures { get; set; } = new();
    }
}
