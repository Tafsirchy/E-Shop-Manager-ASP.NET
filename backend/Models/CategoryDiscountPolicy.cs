namespace EShopManager.API.Models
{
    /// <summary>
    /// Category-wise discount rules applied through polymorphism.
    /// Each policy decides whether it matches a product category and how
    /// much of the line total it discounts. First match in
    /// <see cref="CategoryDiscountCatalog"/> wins.
    /// </summary>
    public abstract class CategoryDiscountPolicy
    {
        public string Label { get; }

        protected CategoryDiscountPolicy(string label) => Label = label;

        public abstract bool Matches(string category);

        public abstract decimal Percentage { get; }

        public virtual decimal DiscountFor(decimal lineTotal) =>
            Math.Round(lineTotal * Percentage / 100m, 2);
    }

    public sealed class SpecificCategoryDiscount : CategoryDiscountPolicy
    {
        private readonly string _category;

        public SpecificCategoryDiscount(string category, decimal percentage) : base($"{category} -{percentage:0.#}%")
        {
            _category = category;
            Percentage = percentage;
        }

        public override bool Matches(string category) =>
            string.Equals(_category, category, StringComparison.OrdinalIgnoreCase);

        public override decimal Percentage { get; }
    }

    public sealed class NoCategoryDiscount : CategoryDiscountPolicy
    {
        public static readonly NoCategoryDiscount Instance = new();

        private NoCategoryDiscount() : base("No category discount") { }

        public override bool Matches(string category) => true;

        public override decimal Percentage => 0m;
    }

    public static class CategoryDiscountCatalog
    {
        private static readonly List<CategoryDiscountPolicy> Policies = new()
        {
            new SpecificCategoryDiscount("jackets", 15m),
            new SpecificCategoryDiscount("hoodies", 10m),
            new SpecificCategoryDiscount("shoes", 10m),
            new SpecificCategoryDiscount("dresses", 5m),
            NoCategoryDiscount.Instance
        };

        public static IReadOnlyList<CategoryDiscountPolicy> All => Policies;

        public static CategoryDiscountPolicy Resolve(string? category) =>
            Policies.First(p => p.Matches(category ?? string.Empty));
    }
}
