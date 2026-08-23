namespace EShopManager.API.Services
{
    using System.Text.RegularExpressions;

    public static class ImageUrls
    {
        public static string Sized(string? url, int width)
        {
            if (string.IsNullOrWhiteSpace(url)) return string.Empty;

            if (url.Contains("images.unsplash.com", StringComparison.OrdinalIgnoreCase))
            {
                if (url.Contains("w=", StringComparison.OrdinalIgnoreCase)) return url;
                var sep = url.Contains('?') ? '&' : '?';
                return $"{url}{sep}auto=format&fit=crop&w={width}&q=70";
            }

            if (TryParsePicsum(url, out var seed, out var w, out var h) && w > width)
            {
                var newH = Math.Max(1, (int)Math.Round(h * (width / (double)w)));
                return $"https://picsum.photos/seed/{seed}/{width}/{newH}";
            }

            return url;
        }

        public static string Srcset(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return string.Empty;
            var isUnsplash = url.Contains("images.unsplash.com", StringComparison.OrdinalIgnoreCase);
            var isPicsum = TryParsePicsum(url, out _, out var w, out _);

            if (!isUnsplash && !isPicsum) return string.Empty;
            if (isUnsplash && url.Contains("w=", StringComparison.OrdinalIgnoreCase)) return string.Empty;
            if (isPicsum && w < 400) return string.Empty;

            var widths = isPicsum ? new[] { 200, 400, 800 }.Where(x => x <= w).Distinct() : new[] { 400, 800, 1200 };
            return string.Join(", ", widths.Select(x => $"{Sized(url, x)} {x}w"));
        }

        private static bool TryParsePicsum(string? url, out string seed, out int width, out int height)
        {
            seed = ""; width = 0; height = 0;
            if (string.IsNullOrWhiteSpace(url)) return false;
            var m = Regex.Match(url, @"^https?://picsum\.photos/seed/([^/]+)/(\d+)/(\d+)", RegexOptions.IgnoreCase);
            if (!m.Success) return false;
            seed = m.Groups[1].Value;
            width = int.Parse(m.Groups[2].Value);
            height = int.Parse(m.Groups[3].Value);
            return true;
        }
    }
}
