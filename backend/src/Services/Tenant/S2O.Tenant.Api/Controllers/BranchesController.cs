using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Shared.Kernel.Interfaces; // Chứa ITenantContext
using S2O.Tenant.App.Features.Branches.Commands;

namespace S2O.Tenant.Api.Controllers;

[Route("api/branches")]
[ApiController]
[Authorize] // Bắt buộc phải có Token
public class BranchesController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ITenantContext _tenantContext; // Inject cái này để lấy TenantId

    public BranchesController(ISender sender, ITenantContext tenantContext)
    {
        _sender = sender;
        _tenantContext = tenantContext;
    }

    [HttpPost]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> Create([FromBody] CreateBranchCommand command)
    {
        var currentTenantId = _tenantContext.TenantId;

        if (!currentTenantId.HasValue || currentTenantId.Value == Guid.Empty)
        {
            return Unauthorized(new { error = "Không tìm thấy thông tin Quán trong Token. Vui lòng đăng nhập lại." });
        }

        var commandWithTenant = command with { TenantId = currentTenantId.Value };

        var result = await _sender.Send(commandWithTenant);

        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}