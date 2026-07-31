using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EShopManager.API.Models;
using EShopManager.API.Services;

namespace EShopManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly UserService _userService;
        private readonly CartService _cartService;
        private readonly WishlistService _wishlistService;

        public AuthController(IConfiguration configuration, UserService userService, CartService cartService, WishlistService wishlistService)
        {
            _configuration = configuration;
            _userService = userService;
            _cartService = cartService;
            _wishlistService = wishlistService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.GuestSessionId))
            {
                var (user, error) = await _userService.RegisterAsync(request.Name, request.Email, request.Password);
                if (user == null) return BadRequest(new { message = error });

                var token = GenerateJwtToken(user);
                return Ok(new { token, email = user.Email, name = user.Name, role = user.Role });
            }

            // Registration after guest session: create account, then merge guest cart/wishlist.
            var (createdUser, regError) = await _userService.RegisterAsync(request.Name, request.Email, request.Password);
            if (createdUser == null) return BadRequest(new { message = regError });

            var mergedCart = await _cartService.MergeGuestIntoUserAsync(request.GuestSessionId, createdUser.Email);
            await _wishlistService.MergeGuestIntoUserAsync(request.GuestSessionId, createdUser.Email);

            var newToken = GenerateJwtToken(createdUser);
            return Ok(new
            {
                token = newToken,
                email = createdUser.Email,
                name = createdUser.Name,
                role = createdUser.Role,
                mergedCartCount = mergedCart.Items.Count,
                conflicts = mergedCart.Conflicts
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (user, error) = await _userService.ValidateCredentialsAsync(request.Email ?? "", request.Password ?? "");
            if (user == null) return Unauthorized(new { message = error });

            // If guest session provided, merge guest data into user account
            object mergeResult = new { mergedCartCount = 0, conflicts = new List<string>() };
            if (!string.IsNullOrEmpty(request.GuestSessionId))
            {
                var cartMerge = await _cartService.MergeGuestIntoUserAsync(request.GuestSessionId!, user.Email);
                await _wishlistService.MergeGuestIntoUserAsync(request.GuestSessionId!, user.Email);
                mergeResult = new { mergedCartCount = cartMerge.Items.Count, conflicts = cartMerge.Conflicts };
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, email = user.Email, name = user.Name, role = user.Role, merge = mergeResult });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _userService.GetByEmailAsync(email ?? "");
            if (user == null) return Unauthorized();

            return Ok(new { email = user.Email, name = user.Name, role = user.Role });
        }

        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminOnly()
        {
            return Ok(new { message = "Welcome Admin! Route protection is working." });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? string.Empty));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpirationInMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? GuestSessionId { get; set; }
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? GuestSessionId { get; set; }
    }
}
