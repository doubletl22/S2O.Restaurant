using MediatR;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Login;

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
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // POST: api/v1/auth/firebase-login
    [HttpPost("firebase-login")]
    public async Task<IActionResult> FirebaseLogin([FromBody] LoginWithFirebaseCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(new { Token = result.Value }) : BadRequest(result.Error);
    }

}