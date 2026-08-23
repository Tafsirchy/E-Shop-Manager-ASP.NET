using System.Text;

namespace EShopManager.API.Services
{
    /// <summary>
    /// Server-side validation for device uploads: extension allow-list,
    /// declared Content-Type check, hard size limit and magic-byte
    /// signature verification (never trust the extension alone).
    /// </summary>
    public static class ImageUploadValidator
    {
        public const long MaxBytes = 5 * 1024 * 1024;
        public const int RequestSizeLimitBytes = 6 * 1024 * 1024;

        private static readonly HashSet<string> AllowedExtensions =
            new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

        public static string? Validate(IFormFile file)
        {
            if (file == null || file.Length == 0) return "No file was provided.";
            if (file.Length > MaxBytes) return "Image exceeds the 5 MB size limit.";

            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
                return $"File type '{ext}' is not allowed. Allowed: JPG, PNG, WebP, GIF.";

            if (string.IsNullOrEmpty(file.ContentType) || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return "Uploaded file is not an image.";

            return null;
        }

        public static bool HasValidSignature(Stream stream, string extension)
        {
            stream.Position = 0;
            try
            {
                Span<byte> buf = stackalloc byte[12];
                var read = stream.ReadAtLeast(buf, 4, false);
                if (read < 4) return false;

                return extension.ToLowerInvariant() switch
                {
                    ".jpg" or ".jpeg" => buf[0] == 0xFF && buf[1] == 0xD8 && buf[2] == 0xFF,
                    ".png" => read >= 8 && buf[0] == 0x89 && buf[1] == 0x50 && buf[2] == 0x4E && buf[3] == 0x47
                              && buf[4] == 0x0D && buf[5] == 0x0A && buf[6] == 0x1A && buf[7] == 0x0A,
                    ".gif" => buf[0] == 0x47 && buf[1] == 0x49 && buf[2] == 0x46 && buf[3] == 0x38,
                    ".webp" => read >= 12
                               && buf[0] == 0x52 && buf[1] == 0x49 && buf[2] == 0x46 && buf[3] == 0x46
                               && buf[8] == 0x57 && buf[9] == 0x45 && buf[10] == 0x42 && buf[11] == 0x50,
                    _ => false
                };
            }
            finally
            {
                stream.Position = 0;
            }
        }
    }
}
