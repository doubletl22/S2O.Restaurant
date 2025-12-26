using Microsoft.AspNetCore.Mvc;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;

namespace S2O.Services.Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Truyền thêm IP Address vào hàm RegisterAsync
        var result = await authService.RegisterAsync(request, GetIpAddress());
        
        if (!result.IsSuccess)
        {
            // Trả về BadRequest nếu thất bại
            return BadRequest(result.Error);
        }
        
        return Ok(result.Value);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Truyền thêm IP Address vào hàm LoginAsync
        var result = await authService.LoginAsync(request, GetIpAddress());
        
        if (!result.IsSuccess)
        {
            return Unauthorized(result.Error);
        }
        
        return Ok(result.Value);
    }

    // Hàm phụ trợ để lấy IP Address từ Request
    private string GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"];
        else
            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "0.0.0.0";
    }
}