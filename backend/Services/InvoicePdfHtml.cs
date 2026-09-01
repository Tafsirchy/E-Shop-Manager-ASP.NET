using System.Text;
using EShopManager.API.Models;
using EShopManager.API.ViewModels;

namespace EShopManager.API.Services
{
    /// <summary>
    /// Builds a self-contained, styled HTML document for an invoice so it can be
    /// rendered to PDF by headless Chrome (PdfService). Uses only inline hex colors
    /// so the output is deterministic and independent of Tailwind/oklab.
    /// </summary>
    public static class InvoicePdfHtml
    {
        public static string Build(InvoiceViewModel model)
        {
            var order = model.Order;
            var orderType = order switch
            {
                PremiumOrder => "Premium",
                BulkOrder => "Bulk",
                _ => "Regular"
            };

            // Volume discounts (non-coupon) percentage, matching the on-screen invoice.
            var discountPercent = 0m;
            var afterCategory = order.Subtotal - order.CategoryDiscountApplied;
            if (afterCategory > 0)
            {
                discountPercent = order.DiscountApplied / afterCategory * 100m;
            }

            var sb = new StringBuilder();
            sb.AppendLine("<!DOCTYPE html>");
            sb.AppendLine("<html lang=\"en\"><head><meta charset=\"utf-8\">");
            sb.AppendLine("<title>Invoice #" + Html(order.Id) + "</title>");
            sb.AppendLine("<style>");
            sb.AppendLine("  * { box-sizing: border-box; }");
            sb.AppendLine("  body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #1E293B; margin: 0; padding: 0; background: #ffffff; }");
            sb.AppendLine("  .card { border: 1px solid #E4E4E7; border-radius: 16px; overflow: hidden; }");
            sb.AppendLine("  .head { background: #09090B; color: #ffffff; padding: 28px 32px; }");
            sb.AppendLine("  .head .brand { font-size: 22px; font-weight: 700; }");
            sb.AppendLine("  .head .sub { color: #a1a1aa; font-size: 13px; margin-top: 2px; }");
            sb.AppendLine("  .badge { display: inline-block; font-size: 12px; font-weight: 600; border-radius: 999px; padding: 4px 12px; background: rgba(255,255,255,0.12); }");
            sb.AppendLine("  .barcode { margin-top: 12px; height: 40px; width: 160px; background-image: repeating-linear-gradient(to right, #09090B 0 2px, transparent 2px 4px, #09090B 4px 5px, transparent 5px 9px, #09090B 9px 12px, transparent 12px 14px); }");
            sb.AppendLine("  .billed { display: flex; gap: 24px; padding: 28px 32px; border-bottom: 1px solid #E4E4E7; }");
            sb.AppendLine("  .billed .right { margin-left: auto; text-align: right; }");
            sb.AppendLine("  .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717A; margin-bottom: 4px; }");
            sb.AppendLine("  table { width: 100%; border-collapse: collapse; }");
            sb.AppendLine("  table th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717A; font-weight: 600; text-align: left; padding: 12px 32px; border-bottom: 1px solid #E4E4E7; }");
            sb.AppendLine("  table th.r, table td.r { text-align: right; }");
            sb.AppendLine("  table th.c, table td.c { text-align: center; }");
            sb.AppendLine("  table td { padding: 14px 32px; border-bottom: 1px solid #E4E4E7; font-size: 14px; }");
            sb.AppendLine("  table td .cat { color: #71717A; font-size: 12px; }");
            sb.AppendLine("  .summary { padding: 24px 32px 28px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }");
            sb.AppendLine("  .sumrow { display: flex; justify-content: space-between; width: 280px; font-size: 14px; color: #71717A; }");
            sb.AppendLine("  .sumrow .save { color: #059669; }");
            sb.AppendLine("  .sumrow.total { border-top: 1px solid #E4E4E7; padding-top: 12px; margin-top: 8px; color: #1E293B; font-weight: 700; font-size: 18px; }");
            sb.AppendLine("  .sumrow.total span:last-child { color: #4338CA; }");
            sb.AppendLine("  .foot { background: #fafafa; border-top: 1px solid #E4E4E7; text-align: center; padding: 20px; color: #71717A; font-size: 13px; }");
            sb.AppendLine("</style></head><body>");
            sb.AppendLine("<div class=\"card\">");

            // Header
            sb.AppendLine("  <div class=\"head\">");
            sb.AppendLine("    <div style=\"display:flex;align-items:flex-start;justify-content:space-between;\">");
            sb.AppendLine("      <div><div class=\"brand\">E&#8209;Shop Manager</div><div class=\"sub\">Invoice for order #" + Html(order.Id) + "</div></div>");
            sb.AppendLine("      <div style=\"text-align:right;\"><span class=\"badge\">" + orderType + " order</span><div class=\"barcode\" style=\"margin-left:auto;\"></div></div>");
            sb.AppendLine("    </div>");
            sb.AppendLine("  </div>");

            // Billed to / details
            sb.AppendLine("  <div class=\"billed\">");
            sb.AppendLine("    <div><div class=\"label\">Billed to</div><div style=\"font-weight:600;\">" + Html(model.CustomerName) + "</div><div style=\"color:#71717A;font-size:13px;\">" + Html(model.CustomerEmail) + "</div></div>");
            sb.AppendLine("    <div class=\"right\"><div class=\"label\">Details</div><div>" + order.CreatedAt.ToLocalTime().ToString("MMMM d, yyyy") + "</div><div style=\"margin-top:4px;font-weight:600;\">" + Html(order.Status) + "</div></div>");
            sb.AppendLine("  </div>");

            // Items table
            sb.AppendLine("  <table>");
            sb.AppendLine("    <thead><tr><th>Item</th><th class=\"c\">Qty</th><th class=\"r\">Unit</th><th class=\"r\">Total</th></tr></thead>");
            sb.AppendLine("    <tbody>");
            foreach (var line in model.Lines)
            {
                sb.AppendLine("      <tr>");
                sb.AppendLine("        <td><div>" + Html(line.Name) + "</div>" + (string.IsNullOrWhiteSpace(line.Category) ? "" : "<div class=\"cat\">" + Html(line.Category) + "</div>") + "</td>");
                sb.AppendLine("        <td class=\"c\">" + line.Quantity + "</td>");
                sb.AppendLine("        <td class=\"r\">" + Tk(line.UnitPrice) + "</td>");
                sb.AppendLine("        <td class=\"r\">" + Tk(line.LineTotal) + "</td>");
                sb.AppendLine("      </tr>");
            }
            sb.AppendLine("    </tbody>");
            sb.AppendLine("  </table>");

            // Summary
            sb.AppendLine("  <div class=\"summary\">");
            sb.AppendLine("    <div class=\"sumrow\"><span>Subtotal</span><span>" + Tk(order.Subtotal) + "</span></div>");
            sb.AppendLine("    <div class=\"sumrow\"><span>Category discounts</span><span class=\"save\">-&#2547;" + Money(order.CategoryDiscountApplied) + "</span></div>");
            sb.AppendLine("    <div class=\"sumrow\"><span>" + orderType + " order discount (" + discountPercent.ToString("0.#") + "%)</span><span class=\"save\">-&#2547;" + Money(order.DiscountApplied) + "</span></div>");
            sb.AppendLine("    <div class=\"sumrow total\"><span>Total paid</span><span>&#2547;" + Money(order.TotalAmount) + "</span></div>");
            sb.AppendLine("  </div>");

            sb.AppendLine("  <div class=\"foot\">Thank you for shopping with E&#8209;Shop Manager!</div>");
            sb.AppendLine("</div></body></html>");

            return sb.ToString();
        }

        private static string Tk(decimal value) => "&#2547;" + Money(value);
        private static string Money(decimal value) => value.ToString("0.##");
        private static string Html(string? value) => System.Net.WebUtility.HtmlEncode(value ?? "");
    }
}
