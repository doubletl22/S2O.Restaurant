using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using S2O.Identity.App.Features.Login;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.Api.Controllers;

[Route("api/v1/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    // POST: api/v1/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result.Value) : MapAuthError(result.Error);
    }

    // POST: api/v1/auth/firebase-login
    [HttpPost("firebase-login")]
    public async Task<IActionResult> FirebaseLogin([FromBody] LoginWithFirebaseCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(new { Token = result.Value }) : MapAuthError(result.Error);
    }

    // POST: api/v1/auth/logout
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // Revoke token/session tại server nếu có (trong tương lai)
        // Hiện tại chỉ return 200 OK
        // Client đã xóa token ở phía client-side
        return Ok(new { message = "Logged out successfully" });
    }

    private IActionResult MapAuthError(Error error)
    {
        var code = error.Code ?? string.Empty;

        if (code.Equals("Auth.UserNotFound", StringComparison.OrdinalIgnoreCase)
            || code.Equals("Auth.InvalidPassword", StringComparison.OrdinalIgnoreCase)
            || code.Equals("Auth.UserLocked", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(error);
        }

        if (code.Equals("Auth.UserDisabled", StringComparison.OrdinalIgnoreCase)
            || code.Equals("Auth.TenantLocked", StringComparison.OrdinalIgnoreCase)
            || code.Equals("Auth.TenantInactive", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, error);
        }

        return BadRequest(error);
    }

}