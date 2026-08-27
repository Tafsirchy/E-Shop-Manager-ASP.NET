using System.Security.Claims;
using EShopManager.API.Models;
using EShopManager.API.Services;
using EShopManager.API.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Linq;

namespace EShopManager.API.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserService _userService;
        private readonly CartService _cartService;
        private readonly WishlistService _wishlistService;
        private readonly CurrentUser _me;

        public AccountController(UserService userService, CartService cartService,
            WishlistService wishlistService, CurrentUser me)
        {
            _userService = userService;
            _cartService = cartService;
            _wishlistService = wishlistService;
            _me = me;
        }

        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            if (_me.IsAuthenticated) return RedirectToAction("Index", "Home");
            return RedirectToAction("Index", "Home", new { auth = "login", returnUrl = returnUrl });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [EnableRateLimiting("auth-ip")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var isAjax = Request.Headers["X-Requested-With"] == "fetch";
            if (!ModelState.IsValid)
            {
                if (isAjax) return Json(new { success = false, errors = string.Join(" ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });
                return View(model);
            }

            var (user, error) = await _userService.ValidateCredentialsAsync(model.Email, model.Password);
            if (user == null)
            {
                var msg = error ?? "Unable to sign in.";
                if (isAjax) return Json(new { success = false, errors = msg });
                ModelState.AddModelError(string.Empty, msg);
                return View(model);
            }

            var mergeResult = await _cartService.MergeGuestIntoUserAsync(_me.EnsureGuestId(), user.Email);
            await _wishlistService.MergeGuestIntoUserAsync(_me.EnsureGuestId(), user.Email);
            _me.ClearGuestCookie();

            await SignInAsync(user);
            TempData["StatusMessage"] = mergeResult.Items.Count > 0
                ? $"Signed in. {mergeResult.Items.Count} item(s) from your guest session were merged into your cart."
                : null;

            if (isAjax)
            {
                var redirect = user.Role == UserRole.Admin
                    ? Url.Action("Index", "Admin")
                    : (!string.IsNullOrEmpty(model.ReturnUrl) && Url.IsLocalUrl(model.ReturnUrl)
                        ? model.ReturnUrl
                        : Url.Action("Index", "Home"));
                return Json(new { success = true, redirectUrl = redirect });
            }

            if (user.Role == UserRole.Admin) return RedirectToAction("Index", "Admin");

            if (!string.IsNullOrEmpty(model.ReturnUrl) && Url.IsLocalUrl(model.ReturnUrl))
                return Redirect(model.ReturnUrl);

            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        public IActionResult Register()
        {
            if (_me.IsAuthenticated) return RedirectToAction("Index", "Home");
            return RedirectToAction("Index", "Home", new { auth = "register" });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [EnableRateLimiting("auth-ip")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var isAjax = Request.Headers["X-Requested-With"] == "fetch";
            if (!ModelState.IsValid)
            {
                if (isAjax) return Json(new { success = false, errors = string.Join(" ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });
                return View(model);
            }

            var guestId = _me.EnsureGuestId();
            var (user, error) = await _userService.RegisterAsync(model.Name, model.Email, model.Password);
            if (user == null)
            {
                var msg = error ?? "Unable to create account.";
                if (isAjax) return Json(new { success = false, errors = msg });
                ModelState.AddModelError(string.Empty, msg);
                return View(model);
            }

            await _cartService.MergeGuestIntoUserAsync(guestId, user.Email);
            await _wishlistService.MergeGuestIntoUserAsync(guestId, user.Email);
            _me.ClearGuestCookie();

            await SignInAsync(user);
            TempData["StatusMessage"] = "Account created successfully. Welcome to E-Shop!";
            if (isAjax) return Json(new { success = true, redirectUrl = Url.Action("Index", "Home") });
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Home");
        }

        private async Task SignInAsync(User user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.Role, user.Role.ToString()),
                new(SecurityStampValidator.ClaimName, user.SecurityStamp.ToString())
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
        }
    }
}
