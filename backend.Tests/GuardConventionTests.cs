using System;
using System.Collections.Generic;
using System.Linq;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using Xunit;

namespace Backend.Tests
{
    /// <summary>
    /// Architecture guard: every state-changing endpoint (POST/PUT/PATCH/DELETE)
    /// must require authorization unless it is on the guest-by-design whitelist.
    /// Prevents future endpoints from silently shipping without an [Authorize].
    /// </summary>
    public class GuardConventionTests
    {
        // Mutations intentionally reachable when signed out. Each relies on
        // antiforgery protection (MVC) or is a token-issuing API endpoint.
        private static readonly HashSet<string> AnonymousMutationsAllowed = new()
        {
            "Login", "Register", "Newsletter", "Contact",
            "Add", "UpdateQuantity", "Remove", "Toggle"
        };

        private static bool IsMutation(MethodInfo action) =>
            action.GetCustomAttribute<HttpPostAttribute>() != null ||
            action.GetCustomAttribute<HttpPutAttribute>() != null ||
            action.GetCustomAttribute<HttpDeleteAttribute>() != null ||
            action.GetCustomAttribute<HttpPatchAttribute>() != null;

        private static IEnumerable<(Type Controller, MethodInfo Action)> MutatingActions()
        {
            var assembly = typeof(UserService).Assembly;
            var controllers = assembly.GetTypes()
                .Where(t => !t.IsAbstract && typeof(ControllerBase).IsAssignableFrom(t));

            foreach (var controller in controllers)
            {
                foreach (var action in controller.GetMethods(
                    BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
                {
                    if (IsMutation(action)) yield return (controller, action);
                }
            }
        }

        [Fact]
        public void All_mutating_endpoints_require_authorization_or_are_whitelisted()
        {
            var mutations = MutatingActions().ToList();
            Assert.True(mutations.Count >= 15,
                $"Expected to discover mutating actions across controllers, found {mutations.Count}. " +
                "If controllers were renamed, update this discovery logic.");

            var violations = new List<string>();
            foreach (var (controller, action) in mutations)
            {
                var guarded =
                    action.GetCustomAttribute<AuthorizeAttribute>(true) != null ||
                    controller.GetCustomAttribute<AuthorizeAttribute>(inherit: true) != null ||
                    AnonymousMutationsAllowed.Contains(action.Name);

                if (!guarded)
                    violations.Add($"{controller.Name}.{action.Name}");
            }

            Assert.True(violations.Count == 0,
                "Mutating endpoints missing [Authorize] and not on the anonymous whitelist:\n" +
                string.Join("\n", violations));
        }

        [Fact]
        public void Anonymous_mutations_on_razor_controllers_carry_antiforgery()
        {
            var violations = new List<string>();
            foreach (var (controller, action) in MutatingActions())
            {
                if (!AnonymousMutationsAllowed.Contains(action.Name)) continue;
                if (controller.Namespace?.Contains(".Api") == true) continue; // token-based API

                var hasAntiforgery = action.GetCustomAttribute<ValidateAntiForgeryTokenAttribute>() != null ||
                                     controller.GetCustomAttribute<ValidateAntiForgeryTokenAttribute>() != null;
                if (!hasAntiforgery)
                    violations.Add($"{controller.Name}.{action.Name}");
            }

            Assert.True(violations.Count == 0,
                "Anonymous Razor mutations must validate antiforgery tokens:\n" +
                string.Join("\n", violations));
        }
    }
}
