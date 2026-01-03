using Microsoft.AspNetCore.Mvc;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("firebase-login")]
    public async Task<IActionResult> FirebaseLogin(
        [FromBody] FirebaseLoginRequest request)
    {
        var token = await _authService.FirebaseLoginAsync(request.IdToken);
        return Ok(new { accessToken = token });
    }
}
