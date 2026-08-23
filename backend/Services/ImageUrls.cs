namespace EShopManager.API.Services
{
    public static class ImageUrls
    {
        public static string Sized(string? url, int width)
        {
            if (string.IsNullOrWhiteSpace(url)) return string.Empty;
            if (!url.Contains("images.unsplash.com", StringComparison.OrdinalIgnoreCase)) return url;
            if (url.Contains("w=", StringComparison.OrdinalIgnoreCase)) return url;
            var sep = url.Contains('?') ? '&' : '?';
            return $"{url}{sep}auto=format&fit=crop&w={width}&q=70";
        }
    }
}
