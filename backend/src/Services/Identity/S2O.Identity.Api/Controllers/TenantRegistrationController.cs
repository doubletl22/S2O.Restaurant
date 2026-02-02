using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Register;
namespace S2O.Identity.Api.Controllers;

// Resource: Tenants (Phần đăng ký)
[Route("api/v1/tenants")]
[ApiController]
public class TenantRegistrationController : ControllerBase
{
    private readonly ISender _sender;

    public TenantRegistrationController(ISender sender)
    {
        _sender = sender;
    }

    // POST: api/v1/tenants/registration
    [HttpPost("registration")]
    //[Authorize(Roles = "SystemAdmin")] 
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}