using Microsoft.AspNetCore.Mvc;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;

namespace S2O.Services.Identity.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Truyền thêm GetIpAddress() vào tham số thứ 2
            var result = await _authService.RegisterAsync(request, GetIpAddress());

            if (result.IsFailure)
            {
                return BadRequest(result.Error);
            }
            return Ok(result.Value);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Truyền thêm GetIpAddress() vào tham số thứ 2
            var result = await _authService.LoginAsync(request, GetIpAddress());

            if (result.IsFailure)
            {
                return Unauthorized(new { message = result.Error });
            }
            return Ok(result.Value);
        }

        // Bổ sung thêm API Refresh Token nếu cần
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var result = await _authService.RefreshTokenAsync(refreshToken, GetIpAddress());
            if (result.IsFailure) return BadRequest(result.Error);
            return Ok(result.Value);
        }

        // --- HÀM LẤY IP (QUAN TRỌNG) ---
        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"]!;

            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "0.0.0.0";
        }
    }
}