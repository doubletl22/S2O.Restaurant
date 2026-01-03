using Microsoft.AspNetCore.Mvc;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.UseCase;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AuthenticateUserHandler _login;
    private readonly RefreshAccessTokenHandler _refresh;
    private readonly LogoutHandler _logout;

    public AuthController(
        AuthenticateUserHandler login,
        RefreshAccessTokenHandler refresh,
        LogoutHandler logout)
    {
        _login = login;
        _refresh = refresh;
        _logout = logout;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var res = await _login.HandleAsync(request, ip);
        return res is null ? Unauthorized() : Ok(res);
    }


    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var res = await _refresh.HandleAsync(request, ip);
        return res is null ? Unauthorized() : Ok(res);
    }

    [HttpPost("logout")] 
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto dto) 
    { 
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ok = await _logout.HandleAsync(dto, ip); 
        return ok ? Ok() : BadRequest("Invalid refresh token"); 
    }
}
