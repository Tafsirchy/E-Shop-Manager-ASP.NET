using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;

namespace EShopManager.API.Services
{
    /// <summary>
    /// Validates that a principal's security-stamp claim matches the user's current
    /// stamp in the database. Lets role changes and bans revoke existing cookies and
    /// JWTs immediately instead of waiting for token expiry.
    /// </summary>
    public class SecurityStampValidator
    {
        public const string ClaimName = "stamp";
        internal const string CachePrefix = "ustamp:";
        internal static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

        private readonly UserService _users;
        private readonly IMemoryCache _cache;

        public SecurityStampValidator(UserService users, IMemoryCache cache)
        {
            _users = users;
            _cache = cache;
        }

        /// <summary>Evicts the cached stamp after a change so revocation is immediate.</summary>
        public void EvictFromCache(string userId) => _cache.Remove(CachePrefix + userId);

        public async Task<bool> IsCurrentAsync(ClaimsPrincipal principal)
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return false;

            var stampClaim = principal.FindFirst(ClaimName)?.Value;
            if (string.IsNullOrEmpty(stampClaim) || !int.TryParse(stampClaim, out var claimed))
                return false; // tokens issued before stamping exist -> force re-login

            var current = await _cache.GetOrCreateAsync(CachePrefix + userId, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheTtl;
                return _users.GetSecurityStampAsync(userId);
            });

            return current.HasValue && current.Value == claimed;
        }
    }
}
