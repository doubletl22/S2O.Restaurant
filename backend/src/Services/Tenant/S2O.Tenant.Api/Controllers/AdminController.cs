using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.Api.Services;

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly IAdminStatsService _adminStatsService;

    public AdminController(IAdminStatsService adminStatsService)
    {
        _adminStatsService = adminStatsService;
    }

    // GET: api/v1/admin/stats
    [HttpGet("stats")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _adminStatsService.GetStatsAsync(Request.Headers.Authorization.ToString(), HttpContext.RequestAborted);
        return Ok(new { IsSuccess = true, Value = stats });
    }
}