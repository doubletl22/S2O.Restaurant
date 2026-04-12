using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.Api.Services;
using S2O.Tenant.App.Features.Tenants.Commands;

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly IAdminStatsService _adminStatsService;
    private readonly ISender _sender;

    public AdminController(IAdminStatsService adminStatsService, ISender sender)
    {
        _adminStatsService = adminStatsService;
        _sender = sender;
    }

    // GET: api/v1/admin/stats
    [HttpGet("stats")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetStats([FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null)
    {
        if (from.HasValue && to.HasValue && from.Value > to.Value)
        {
            return BadRequest(new
            {
                IsSuccess = false,
                Error = new
                {
                    Code = "INVALID_DATE_RANGE",
                    Description = "Ngày bắt đầu không được lớn hơn ngày kết thúc."
                }
            });
        }

        var stats = await _adminStatsService.GetStatsAsync(
            Request.Headers.Authorization.ToString(),
            from,
            to,
            HttpContext.RequestAborted);
        return Ok(new { IsSuccess = true, Value = stats });
    }

    // POST: api/v1/admin/tenants/{tenantId}/renew?months=1
    [HttpPost("tenants/{tenantId:guid}/renew")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> RenewTenantSubscription(Guid tenantId, [FromQuery] int months = 1)
    {
        var result = await _sender.Send(new RenewTenantSubscriptionCommand(tenantId, months));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}