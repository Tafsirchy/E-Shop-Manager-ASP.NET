using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;

namespace EShopManager.API.Controllers.Api
{
    [ApiController]
    [Route("api/auth")]
    public class ApiAuthController : ControllerBase
    {
        private readonly UserService _users;
        private readonly TokenService _tokens;

        public ApiAuthController(UserService users, TokenService tokens)
        {
            _users = users;
            _tokens = tokens;
        }

        public record LoginRequest(string Email, string Password);
        public record LoginResponse(string AccessToken, string TokenType, DateTime ExpiresAt, string Name, string Email, string Role);

        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting("auth-ip")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            var (user, error) = await _users.ValidateCredentialsAsync(request.Email, request.Password);
            if (user == null) return Unauthorized(new { error });

            var (token, expiresAt) = _tokens.CreateToken(user);
            return Ok(new LoginResponse(token, "Bearer", expiresAt, user.Name, user.Email, user.Role.ToString()));
        }

        [HttpGet("me")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public IActionResult Me()
        {
            return Ok(new
            {
                id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                name = User.Identity?.Name,
                email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
                role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
            });
        }
    }
}
