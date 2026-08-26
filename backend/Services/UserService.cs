using EShopManager.API.Models;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Driver;
using System.Security.Cryptography;

namespace EShopManager.API.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMemoryCache _cache;

        public UserService(IMongoDatabase database, IMemoryCache? cache = null)
        {
            _usersCollection = database.GetCollection<User>("Customers");
            _cache = cache ?? new MemoryCache(Microsoft.Extensions.Options.Options.Create(new MemoryCacheOptions()));
            var indexKeys = Builders<User>.IndexKeys.Ascending(x => x.Email);
            var indexOptions = new CreateIndexOptions { Unique = true };
            _usersCollection.Indexes.CreateOne(new CreateIndexModel<User>(indexKeys, indexOptions));
        }

        /// <summary>Emails are stored canonically lowercased; lookups are exact matches so the unique index is used.</summary>
        public static string NormalizeEmail(string? email) => (email ?? "").Trim().ToLowerInvariant();

        public async Task<User?> GetByEmailAsync(string email)
        {
            var normalized = NormalizeEmail(email);
            if (normalized.Length == 0) return null;
            return await _usersCollection.Find(x => x.Email == normalized).FirstOrDefaultAsync();
        }

        public async Task<List<User>> GetAllAsync() =>
            await _usersCollection.Find(Builders<User>.Filter.Empty).ToListAsync();

        // Returns (user, errorMessage). errorMessage is null on success.
        public async Task<(User? User, string? Error)> RegisterAsync(string name, string email, string password)
        {
            name = name?.Trim() ?? "";
            email = email?.Trim() ?? "";
            password = password ?? "";

            if (name.Length == 0) return (null, "Name is required.");
            if (!IsValidEmail(email)) return (null, "A valid email address is required.");
            if (password.Length < 6) return (null, "Password must be at least 6 characters.");

            var existing = await GetByEmailAsync(email);
            if (existing != null) return (null, "An account with this email already exists.");

            var user = new User
            {
                Name = name,
                Email = NormalizeEmail(email),
                PasswordHash = HashPassword(password),
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                await _usersCollection.InsertOneAsync(user);
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                return (null, "An account with this email already exists.");
            }

            return (user, null);
        }

        // Precomputed hash of an unknown password; verified against when the email is
        // unknown so that response timing cannot reveal whether an account exists.
        private static readonly string DummyPasswordHash = HashPassword(Guid.NewGuid().ToString());

        public async Task<(User? User, string? Error)> ValidateCredentialsAsync(string email, string password)
        {
            var user = await GetByEmailAsync(email);
            if (user == null)
            {
                VerifyPassword(password ?? "", DummyPasswordHash);
                return (null, "Invalid email or password.");
            }
            if (!VerifyPassword(password ?? "", user.PasswordHash)) return (null, "Invalid email or password.");
            return (user, null);
        }

        public async Task UpdateRoleAsync(string userId, string role)
        {
            var parsed = Enum.TryParse<UserRole>(role, ignoreCase: true, out var value)
                ? value : UserRole.Customer;
            var update = Builders<User>.Update
                .Set(x => x.Role, parsed)
                .Inc(x => x.SecurityStamp, 1);
            await _usersCollection.UpdateOneAsync(x => x.Id == userId, update);
            _cache.Remove(SecurityStampValidator.CachePrefix + userId);
        }

        /// <summary>Returns the user's current security stamp, or null if the user does not exist.</summary>
        public async Task<int?> GetSecurityStampAsync(string userId) =>
            await _usersCollection.Find(x => x.Id == userId)
                .Project(u => (int?)u.SecurityStamp)
                .FirstOrDefaultAsync();

        public static string HashPassword(string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] hash = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, 100_000, 32);
            return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        public static bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrEmpty(storedHash)) return false;
            var parts = storedHash.Split('.');
            if (parts.Length != 2) return false;

            try
            {
                var salt = Convert.FromBase64String(parts[0]);
                var expected = Convert.FromBase64String(parts[1]);
                var actual = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, 100_000, 32);
                return CryptographicOperations.FixedTimeEquals(actual, expected);
            }
            catch
            {
                return false;
            }
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}
