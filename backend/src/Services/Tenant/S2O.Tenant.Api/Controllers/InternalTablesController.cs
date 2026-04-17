using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.Infra.Persistence;

namespace S2O.Tenant.Api.Controllers;

[Route("api/internal/tables")]
[ApiController]
public class InternalTablesController : ControllerBase
{
    private readonly TenantDbContext _context;

    public InternalTablesController(TenantDbContext context)
    {
        _context = context;
    }

    public sealed record UpdateTableOccupancyRequest(bool IsOccupied);

    // Internal endpoint for cross-service sync (Order -> Tenant).
    [HttpPatch("{tableId:guid}/occupancy")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateOccupancy(Guid tableId, [FromBody] UpdateTableOccupancyRequest request)
    {
        var table = await _context.Tables
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == tableId);

        if (table == null)
        {
            return NotFound(new { message = "Table not found" });
        }

        table.IsOccupied = request.IsOccupied;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            table.Id,
            table.IsOccupied,
            SyncedAtUtc = DateTime.UtcNow
        });
    }
}
