using System.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace EShopManager.API.Services
{
    /// <summary>
    /// Generates PDFs from HTML by invoking the local headless-Chrome script
    /// (backend/pdf/generate.js via puppeteer-core). Mirrors the pattern used
    /// by EmailService (backend/email/send.js). Chrome is located automatically
    /// by the script or via the EShop_PDF_CHROME configuration key.
    /// </summary>
    public class PdfService
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<PdfService> _logger;

        public PdfService(IConfiguration config, IWebHostEnvironment env, ILogger<PdfService> logger)
        {
            _config = config;
            _env = env;
            _logger = logger;
        }

        /// <summary>
        /// Renders the supplied HTML to PDF bytes. Returns null if generation fails.
        /// </summary>
        public async Task<(byte[]? Bytes, string? Error)> RenderAsync(string html, string baseFileName)
        {
            var projectDir = _env.ContentRootPath;
            var script = Path.Combine(projectDir, "pdf", "generate.js");
            if (!File.Exists(script))
            {
                var err = $"PDF script not found at {script}.";
                _logger.LogWarning(err);
                return (null, err);
            }

            var tempDir = Path.Combine(Path.GetTempPath(), "eshop-pdf");
            Directory.CreateDirectory(tempDir);
            var htmlPath = Path.Combine(tempDir, $"{baseFileName}_{Guid.NewGuid():N}.html");
            var pdfPath = Path.Combine(tempDir, $"{baseFileName}_{Guid.NewGuid():N}.pdf");

            try
            {
                await File.WriteAllTextAsync(htmlPath, html);

                var psi = new ProcessStartInfo
                {
                    FileName = "node",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WorkingDirectory = projectDir
                };
                psi.ArgumentList.Add(script);
                psi.ArgumentList.Add("--html"); psi.ArgumentList.Add(htmlPath);
                psi.ArgumentList.Add("--out"); psi.ArgumentList.Add(pdfPath);

                var chrome = _config["Pdf:ChromePath"] ?? Environment.GetEnvironmentVariable("EShop_PDF_CHROME");
                if (!string.IsNullOrWhiteSpace(chrome))
                {
                    psi.Environment["EShop_PDF_CHROME"] = chrome;
                }

                using var proc = Process.Start(psi);
                if (proc == null)
                {
                    var err = "Failed to start PDF process.";
                    _logger.LogWarning(err);
                    return (null, err);
                }

                var stdout = await proc.StandardOutput.ReadToEndAsync().ConfigureAwait(false);
                var stderr = await proc.StandardError.ReadToEndAsync().ConfigureAwait(false);
                await proc.WaitForExitAsync().ConfigureAwait(false);

                if (stdout.Contains("PDF_GENERATED") && File.Exists(pdfPath))
                {
                    return (await File.ReadAllBytesAsync(pdfPath).ConfigureAwait(false), null);
                }

                var errOutput = !string.IsNullOrWhiteSpace(stderr) ? stderr.Trim() : stdout.Trim();
                _logger.LogWarning("PDF generation failed. stdout={Stdout} stderr={Stderr}",
                    stdout.Trim(), stderr.Trim());
                return (null, errOutput);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "PDF generation threw.");
                return (null, ex.Message);
            }
            finally
            {
                TryDelete(htmlPath);
                TryDelete(pdfPath);
            }
        }

        private static void TryDelete(string path)
        {
            try { if (File.Exists(path)) File.Delete(path); }
            catch { }
        }
    }
}
