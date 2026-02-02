using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.App.Abstractions; // Đảm bảo import đúng namespace DbContext

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly ITenantDbContext _context;

    public AdminController(ITenantDbContext context)
    {
        _context = context;
    }

    // GET: api/v1/admin/stats
    [HttpGet("stats")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetStats()
    {
        var totalTenants = await _context.Tenants.CountAsync();
        var activeTenants = await _context.Tenants.CountAsync(t => t.IsActive && !t.IsLocked);
        var stats = new
        {
            TotalTenants = totalTenants,
            ActiveTenants = activeTenants,
            TotalRevenue = 0,
            TotalUsers = 0    
        };

        return Ok(new { IsSuccess = true, Value = stats });
    }
}