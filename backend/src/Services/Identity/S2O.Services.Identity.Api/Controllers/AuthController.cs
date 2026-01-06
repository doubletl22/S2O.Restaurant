using Microsoft.AspNetCore.Mvc;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.UseCase;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthenticateUserHandler _login;
    private readonly RefreshAccessTokenHandler _refresh;
    private readonly LogoutHandler _logout;
    private readonly RegisterUserHandler _register;
    private readonly PasswordLoginHandler _passwordLoginHandler;

    public AuthController(
        AuthenticateUserHandler login,
        RefreshAccessTokenHandler refresh,
        LogoutHandler logout,
        RegisterUserHandler register,
        PasswordLoginHandler passwordLoginHandler)
    {
        _login = login;
        _refresh = refresh;
        _logout = logout;
        _register = register;
        _passwordLoginHandler = passwordLoginHandler;
    }

    [HttpPost("firebase-login")]
    public async Task<IActionResult> LoginFirebase([FromBody] LoginFirebaseRequestDto request)
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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        await _register.HandleAsync(dto);
        return StatusCode(201);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var res = await _passwordLoginHandler.HandlerAsync(dto, ip);
        return res is null ? Unauthorized() : Ok(res);

    }

}
