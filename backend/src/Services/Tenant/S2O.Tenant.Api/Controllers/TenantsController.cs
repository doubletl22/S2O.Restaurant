using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.App.Features.Tenants.Commands;
using S2O.Tenant.App.Features.Tenants.Queries;

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/tenants")]
[ApiController]
public class TenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET: api/v1/tenants
    [HttpGet]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllTenantsQuery());
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // POST: api/v1/tenants/{id}/lock
    [HttpPost("{id}/lock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ToggleLock(Guid id)
    {
        // Gộp lock/unlock vào 1 logic hoặc tách ra tùy Command của bạn
        // Giả sử bạn dùng ToggleTenantLockCommand(id, isLocked)
        var result = await _mediator.Send(new ToggleTenantLockCommand(id, true));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // POST: api/v1/tenants/{id}/unlock
    [HttpPost("{id}/unlock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> Unlock(Guid id)
    {
        var result = await _mediator.Send(new ToggleTenantLockCommand(id, false));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}