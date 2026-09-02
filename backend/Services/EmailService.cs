using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace EShopManager.API.Services
{
    /// <summary>
    /// Sends transactional emails by invoking the local nodemailer script
    /// (backend/email/send.js). SMTP credentials are read from configuration so
    /// they can be supplied via environment variables like the Stripe key.
    /// Requires node/npm (already used by the project's Tailwind build).
    /// </summary>
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, IWebHostEnvironment env, ILogger<EmailService> logger)
        {
            _config = config;
            _env = env;
            _logger = logger;
        }

        /// <summary>Builds and queues the in-app email template content.</summary>
        public Task SendDeliveredAsync(string toAddress, string customerName, string orderId, string? trackingNumber)
        {
            var shortId = orderId.Length > 8 ? orderId[..8] : orderId;
            var subject = $"Your E-Shop order #{shortId} has been delivered";
            var trackingLine = string.IsNullOrWhiteSpace(trackingNumber)
                ? "<p style=\"margin:0 0 12px;\">No tracking number was provided. Please check your order details page for the latest status.</p>"
                : $"<p style=\"margin:0 0 12px;\">Tracking number: <strong>{HtmlEncode(trackingNumber)}</strong></p>";

            var body = $@"
<html><body style=""margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;"">
<div style=""max-width:560px;margin:0 auto;padding:24px;"">
  <div style=""background:#111827;padding:24px 28px;border-radius:12px 12px 0 0;"">
    <p style=""margin:0;color:#fff;font-size:20px;font-weight:700;"">E&#8209;Shop Manager</p>
  </div>
  <div style=""background:#ffffff;padding:28px;border-radius:0 0 12px 12px;"">
    <h2 style=""margin:0 0 12px;color:#111827;"">Hi {HtmlEncode(customerName)},</h2>
    <p style=""margin:0 0 12px;color:#374151;"">Great news! Your order <strong>#{HtmlEncode(orderId)}</strong> has been marked as <strong>Delivered</strong>.</p>
    {trackingLine}
    <p style=""margin:0 0 20px;color:#374151;"">Thank you for shopping with E&#8209;Shop Manager!</p>
    <a href=""mailto:support@eshop.local"" style=""display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;"">Contact Support</a>
  </div>
  <p style=""text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;"">You received this because you placed order #{HtmlEncode(orderId)} at E&#8209;Shop Manager.</p>
</div>
</body></html>";

            return SendAsync(toAddress, subject, body);
        }

        /// <summary>Runs the nodemailer script in the background (fire-and-forget).</summary>
        private Task SendAsync(string toAddress, string subject, string htmlBody)
        {
            try
            {
                var projectDir = _env.ContentRootPath;
                var script = Path.Combine(projectDir, "email", "send.js");
                if (!File.Exists(script))
                {
                    _logger.LogWarning("Email script not found at {Script}; skipping email to {To}.", script, toAddress);
                    return Task.CompletedTask;
                }

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
                psi.ArgumentList.Add("--to"); psi.ArgumentList.Add(toAddress);
                psi.ArgumentList.Add("--subject"); psi.ArgumentList.Add(subject);
                psi.ArgumentList.Add("--html"); psi.ArgumentList.Add(htmlBody);

                psi.Environment["EShop_SMTP_HOST"] = _config["Email:SmtpHost"] ?? Environment.GetEnvironmentVariable("EShop_SMTP_HOST") ?? "";
                psi.Environment["EShop_SMTP_PORT"] = _config["Email:SmtpPort"] ?? Environment.GetEnvironmentVariable("EShop_SMTP_PORT") ?? "587";
                psi.Environment["EShop_SMTP_USER"] = _config["Email:SmtpUser"] ?? Environment.GetEnvironmentVariable("EShop_SMTP_USER") ?? "";
                psi.Environment["EShop_SMTP_PASS"] = _config["Email:SmtpPass"] ?? Environment.GetEnvironmentVariable("EShop_SMTP_PASS") ?? "";
                psi.Environment["EShop_SMTP_FROM_NAME"] = _config["Email:FromName"] ?? Environment.GetEnvironmentVariable("EShop_SMTP_FROM_NAME") ?? "";
                psi.Environment["EShop_SMTP_FROM_ADDR"] = _config["Email:FromAddress"] ?? Environment.GetEnvironmentVariable("EShop_SMTP_FROM_ADDR") ?? "";

                // Run off the request thread so a slow SMTP server never blocks the admin UI.
                _ = Task.Run(async () =>
                {
                    using var proc = Process.Start(psi);
                    if (proc == null)
                    {
                        _logger.LogWarning("Failed to start email process for {To}.", toAddress);
                        return;
                    }
                    var stdout = await proc.StandardOutput.ReadToEndAsync().ConfigureAwait(false);
                    var stderr = await proc.StandardError.ReadToEndAsync().ConfigureAwait(false);
                    await proc.WaitForExitAsync().ConfigureAwait(false);
                    if (stdout.Contains("EMAIL_SENT") || stdout.Contains("EMAIL_NOT_CONFIGURED"))
                    {
                        _logger.LogInformation("Email to {To}: {Output}", toAddress, stdout.Trim());
                    }
                    else
                    {
                        _logger.LogWarning("Email to {To} failed. stdout={Stdout} stderr={Stderr}",
                            toAddress, stdout.Trim(), stderr.Trim());
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not send email to {To}.", toAddress);
            }

            return Task.CompletedTask;
        }

        private static string HtmlEncode(string value) =>
            System.Net.WebUtility.HtmlEncode(value ?? "");
    }
}
