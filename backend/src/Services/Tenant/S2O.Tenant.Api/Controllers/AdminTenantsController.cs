using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using S2O.Tenant.App.Features.Tenants.Queries;
using S2O.Tenant.App.Features.Tenants.Commands;

namespace S2O.Tenant.Api.Controllers;

[Route("api/admin/tenants")] // URL riêng cho admin
[ApiController]
[Authorize(Roles = "SystemAdmin")] // [QUAN TRỌNG] Chỉ SuperAdmin mới vào được
public class AdminTenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminTenantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // 1. Xem danh sách toàn bộ nhà hàng
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllTenantsQuery());
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 2. Khóa nhà hàng (Ví dụ: api/admin/tenants/{id}/lock)
    [HttpPost("{id}/lock")]
    public async Task<IActionResult> LockTenant(Guid id)
    {
        var result = await _mediator.Send(new ToggleTenantLockCommand(id, true));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 3. Mở khóa
    [HttpPost("{id}/unlock")]
    public async Task<IActionResult> UnlockTenant(Guid id)
    {
        var result = await _mediator.Send(new ToggleTenantLockCommand(id, false));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // PUT: api/admin/tenants/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] UpdateTenantCommand command)
    {
        if (id != command.Id) return BadRequest("ID không khớp");

        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);

        return Ok(result.Value);
    }

    // DELETE: api/admin/tenants/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTenant(Guid id)
    {
        var command = new DeleteTenantCommand(id);
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);

        return NoContent(); // 204 Deleted
    }
}