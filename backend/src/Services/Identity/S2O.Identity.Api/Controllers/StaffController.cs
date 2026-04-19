using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Register;
using S2O.Identity.App.Features.Users.Commands;
using S2O.Identity.App.Features.Users.Queries;

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

    private bool TryGetCurrentTenantId(out Guid tenantId)
    {
        tenantId = Guid.Empty;

        var tenantClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrWhiteSpace(tenantClaim))
        {
            return false;
        }

        return Guid.TryParse(tenantClaim, out tenantId);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? keyword = null, [FromQuery] Guid? branchId = null)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        var query = new GetOwnerStaffQuery(tenantId, branchId, keyword);

        var result = await _sender.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterStaffCommand command)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        var safeCommand = command with { TenantId = tenantId };

        var result = await _sender.Send(safeCommand);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffCommand command)
    {
        if (id != command.UserId) return BadRequest("ID không khớp");

        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        var safeCommand = command with { TenantId = tenantId }; 

        var result = await _sender.Send(safeCommand);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        var command = new DeleteStaffCommand(id, tenantId);

        var result = await _sender.Send(command);

        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}