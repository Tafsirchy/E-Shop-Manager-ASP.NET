using System.Security.Claims;

namespace EShopManager.API.Services
{
    public class CurrentUser
    {
        public const string GuestCookieName = "EShopGuest";

        private readonly IHttpContextAccessor _http;

        public CurrentUser(IHttpContextAccessor http)
        {
            _http = http;
        }

        private HttpContext Ctx =>
            _http.HttpContext ?? throw new InvalidOperationException("No active HttpContext.");

        public bool IsAuthenticated => Ctx.User.Identity?.IsAuthenticated == true;

        public string Name => Ctx.User.FindFirstValue(ClaimTypes.Name) ?? "";

        public string Email => Ctx.User.FindFirstValue(ClaimTypes.Email) ?? "";

        public string Role => Ctx.User.FindFirstValue(ClaimTypes.Role) ?? "";

        public string SubjectId => Ctx.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        public string ReviewerKey => string.IsNullOrEmpty(SubjectId) ? Email : SubjectId;

        public string OwnerKey
        {
            get
            {
                if (IsAuthenticated && !string.IsNullOrEmpty(Email)) return Email;
                return EnsureGuestId();
            }
        }

        public string EnsureGuestId()
        {
            var ctx = Ctx;
            if (ctx.Request.Cookies.TryGetValue(GuestCookieName, out var existing) &&
                !string.IsNullOrWhiteSpace(existing))
            {
                return existing;
            }

            var id = Guid.NewGuid().ToString("N");
            ctx.Response.Cookies.Append(GuestCookieName, id, new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                IsEssential = true,
                MaxAge = TimeSpan.FromDays(30)
            });
            return id;
        }

        public void ClearGuestCookie()
        {
            Ctx.Response.Cookies.Delete(GuestCookieName);
        }
    }
}
