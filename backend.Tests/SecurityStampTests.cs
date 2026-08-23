using System;
using System.Security.Claims;
using System.Threading.Tasks;
using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Xunit;

namespace EShopManager.API.Tests
{
    [Collection("ephemeral-mongo")]
    public class SecurityStampTests
    {
        private readonly MongoFixture _mongo;

        public SecurityStampTests(MongoFixture mongo) => _mongo = mongo;

        [Fact]
        public async Task UpdateRole_BumpsStamp_AndStaleTokensStopValidating()
        {
            var db = _mongo.CreateDatabase();
            var users = new UserService(db);
            var validator = new SecurityStampValidator(users,
                new MemoryCache(Options.Create(new MemoryCacheOptions())));

            var (user, error) = await users.RegisterAsync(
                "Stamp Tester", $"stamp-{Guid.NewGuid():N}@test.io", "secret1");
            Assert.Null(error);
            Assert.NotNull(user);
            var originalStamp = user!.SecurityStamp;

            await users.UpdateRoleAsync(user.Id, nameof(UserRole.Admin));

            var currentStamp = await users.GetSecurityStampAsync(user.Id);
            Assert.True(currentStamp > originalStamp);

            var stalePrincipal = BuildPrincipal(user.Id, originalStamp);
            var freshPrincipal = BuildPrincipal(user.Id, currentStamp!.Value);

            Assert.False(await validator.IsCurrentAsync(stalePrincipal));
            Assert.True(await validator.IsCurrentAsync(freshPrincipal));
        }

        [Fact]
        public async Task MissingStampClaim_UnknownUser_Or_DeletedUser_IsRejected()
        {
            var db = _mongo.CreateDatabase();
            var users = new UserService(db);
            var validator = new SecurityStampValidator(users,
                new MemoryCache(Options.Create(new MemoryCacheOptions())));

            // token issued before stamping existed: no claim -> rejected
            var noClaim = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "someone")
            }, "TestAuth"));
            Assert.False(await validator.IsCurrentAsync(noClaim));

            // unknown/deleted user: DB lookup returns null -> rejected
            var ghost = BuildPrincipal("does-not-exist", 1);
            Assert.False(await validator.IsCurrentAsync(ghost));
        }

        private static ClaimsPrincipal BuildPrincipal(string userId, int stamp) =>
            new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(SecurityStampValidator.ClaimName, stamp.ToString())
            }, "TestAuth"));
    }
}
