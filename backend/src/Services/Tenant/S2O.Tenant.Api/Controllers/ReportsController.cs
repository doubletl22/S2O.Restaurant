using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/reports")]
[ApiController]
public class ReportsController : ControllerBase
{
    // NOTE: All Report endpoints return NoContent (204) by design.
    // The frontend has fallback logic to aggregate stats from individual service endpoints:
    // - /api/v1/orders (Order service)
    // - /api/v1/products (Catalog service)  
    // - /api/v1/staff (Identity service)
    // - /api/v1/branches (Tenant service)
    // By returning NoContent instead of NotFound, we indicate endpoints exist but there's no direct response,
    // allowing the frontend to proceed with its fallback aggregation logic without 404 errors.

    // GET: api/v1/reports/dashboard
    [HttpGet("dashboard")]
    [Authorize]
    public IActionResult GetDashboard()
    {
        return NoContent();
    }

    // GET: api/v1/reports/revenue/branches?allTime=...&from=...&to=...
    [HttpGet("revenue/branches")]
    [Authorize]
    public IActionResult GetRevenueByBranches()
    {
        return NoContent();
    }

    // GET: api/v1/reports/branch-revenue?allTime=...&from=...&to=...
    [HttpGet("branch-revenue")]
    [Authorize]
    public IActionResult GetBranchRevenue()
    {
        return NoContent();
    }

    // GET: api/v1/reports/revenue-by-branch?allTime=...&from=...&to=...
    [HttpGet("revenue-by-branch")]
    [Authorize]
    public IActionResult GetRevenueByBranch()
    {
        return NoContent();
    }

    // GET: api/v1/reports/revenue-data?allTime=...&from=...&to=...&branchId=...
    [HttpGet("revenue-data")]
    [Authorize]
    public IActionResult GetRevenueData()
    {
        return NoContent();
    }

    // GET: api/v1/reports/revenue?allTime=...&from=...&to=...
    [HttpGet("revenue")]
    [Authorize]
    public IActionResult GetRevenue()
    {
        return NoContent();
    }
}
