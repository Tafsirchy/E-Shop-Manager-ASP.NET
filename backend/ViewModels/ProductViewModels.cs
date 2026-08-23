using EShopManager.API.Models;

namespace EShopManager.API.ViewModels
{
    public class ProductListViewModel
    {
        public List<Product> Products { get; set; } = new();
        public string? Search { get; set; }
        public string? Category { get; set; }
        public string? Sort { get; set; }
    }

    public class ProductDetailsViewModel
    {
        public Product Product { get; set; } = null!;
        public List<Review> Reviews { get; set; } = new();
        public bool IsSignedIn { get; set; }
        public string? StatusMessage { get; set; }
        public bool StatusIsError { get; set; }

        [System.ComponentModel.DataAnnotations.Range(1, 5)]
        public int Rating { get; set; } = 5;

        public string? ReviewTitle { get; set; }
        public string? Comment { get; set; }
    }
}
