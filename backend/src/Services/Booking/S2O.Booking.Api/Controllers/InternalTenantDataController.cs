using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Booking.Infra.Persistence;

namespace S2O.Booking.Api.Controllers;

[Route("api/internal/tenant-data")]
[ApiController]
[Authorize(Roles = "SystemAdmin")]
public class InternalTenantDataController : ControllerBase
{
    private readonly BookingDbContext _context;

    public InternalTenantDataController(BookingDbContext context)
    {
        _context = context;
    }

    [HttpDelete("{tenantId:guid}")]
    public async Task<IActionResult> DeleteByTenant(Guid tenantId, CancellationToken ct)
    {
        var bookings = await _context.Bookings
            .IgnoreQueryFilters()
            .Where(b => b.TenantId == tenantId)
            .ToListAsync(ct);

        var tables = await _context.Tables
            .IgnoreQueryFilters()
            .Where(t => t.TenantId == tenantId)
            .ToListAsync(ct);

        if (bookings.Count > 0)
        {
            _context.Bookings.RemoveRange(bookings);
        }

        if (tables.Count > 0)
        {
            _context.Tables.RemoveRange(tables);
        }

        await _context.SaveChangesAsync(ct);

        return Ok(new
        {
            deletedBookings = bookings.Count,
            deletedTables = tables.Count
        });
    }
}
