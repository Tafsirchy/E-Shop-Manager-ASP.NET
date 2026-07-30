namespace EShopManager.API.Services
{
    public class CartOperationResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public int? Available { get; set; }
        public object? Payload { get; set; }
    }
}
