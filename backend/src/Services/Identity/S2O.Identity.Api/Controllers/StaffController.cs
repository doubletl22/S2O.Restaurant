using System.Security.Claims; // [New]
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Register;
using S2O.Identity.App.Features.Users.Commands;
using S2O.Identity.App.Features.Users.Queries;
using S2O.Shared.Kernel.Results; // Đảm bảo import Result class

namespace S2O.Identity.Api.Controllers;

[Route("api/v1/staff")]
[ApiController]
[Authorize(Roles = "RestaurantOwner, SystemAdmin")]
public class StaffController : ControllerBase
{
    private readonly ISender _sender;

    public StaffController(ISender sender)
    {
        _sender = sender;
    }

    private Guid GetCurrentTenantId()
    {
        var tenantClaim = User.FindFirst("tenant_id")?.Value;
        return tenantClaim != null ? Guid.Parse(tenantClaim) : Guid.Empty;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? keyword = null, [FromQuery] Guid? branchId = null)
    {
        var tenantId = GetCurrentTenantId();

        var query = new GetOwnerStaffQuery(tenantId, branchId, keyword);

        var result = await _sender.Send(query);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterStaffCommand command)
    {
        var tenantId = GetCurrentTenantId();

        var safeCommand = command with { TenantId = tenantId };

        var result = await _sender.Send(safeCommand);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffCommand command)
    {
        if (id != command.UserId) return BadRequest("ID không khớp");

        var tenantId = GetCurrentTenantId();
        var safeCommand = command with { TenantId = tenantId }; 

        var result = await _sender.Send(safeCommand);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var tenantId = GetCurrentTenantId(); 

        var command = new DeleteStaffCommand(id, tenantId);

        var result = await _sender.Send(command);

        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}