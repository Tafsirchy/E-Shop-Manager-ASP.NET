using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EShopManager.API.Models;

namespace EShopManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly EShopManager.API.Services.CartService _cartService;
        private readonly EShopManager.API.Services.WishlistService _wishlistService;

        public AuthController(IConfiguration configuration, EShopManager.API.Services.CartService cartService, EShopManager.API.Services.WishlistService wishlistService)
        {
            _configuration = configuration;
            _cartService = cartService;
            _wishlistService = wishlistService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // TODO: Validate against MongoDB users collection
            // Hardcoded check for initial testing
            if (request.Email == "admin@eshop.com" && request.Password == "admin")
            {
                var token = GenerateJwtToken(request.Email, "Admin");

                // If guest session provided, merge guest data into user account
                if (!string.IsNullOrEmpty(request.GuestSessionId))
                {
                    try
                    {
                        await _cartService.MergeGuestIntoUserAsync(request.GuestSessionId!, request.Email);
                        await _wishlistService.MergeGuestIntoUserAsync(request.GuestSessionId!, request.Email);
                    }
                    catch { /* swallow merge errors for now */ }
                }

                return Ok(new { token });
            }

            return Unauthorized();
        }

        [HttpGet("admin-only")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public IActionResult AdminOnly()
        {
            return Ok(new { message = "Welcome Admin! Route protection is working." });
        }

        private string GenerateJwtToken(string email, string role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? string.Empty));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
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
}
