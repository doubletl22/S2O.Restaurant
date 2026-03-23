using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Order.Infra.Persistence;

namespace S2O.Order.Api.Controllers;

[Route("api/internal/tenant-data")]
[ApiController]
[Authorize(Roles = "SystemAdmin")]
public class InternalTenantDataController : ControllerBase
{
    private readonly OrderDbContext _context;

    public InternalTenantDataController(OrderDbContext context)
    {
        _context = context;
    }

    [HttpDelete("{tenantId:guid}")]
    public async Task<IActionResult> DeleteByTenant(Guid tenantId, CancellationToken ct)
    {
        var orders = await _context.Orders
            .IgnoreQueryFilters()
            .Where(o => o.TenantId == tenantId)
            .ToListAsync(ct);

        if (orders.Count > 0)
        {
            _context.Orders.RemoveRange(orders);
            await _context.SaveChangesAsync(ct);
        }

        return Ok(new
        {
            deletedOrders = orders.Count
        });
    }
}
