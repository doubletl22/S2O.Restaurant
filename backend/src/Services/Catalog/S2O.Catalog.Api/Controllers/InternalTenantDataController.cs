using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.Infra.Persistence;

namespace S2O.Catalog.Api.Controllers;

[Route("api/internal/tenant-data")]
[ApiController]
[Authorize(Roles = "SystemAdmin")]
public class InternalTenantDataController : ControllerBase
{
    private readonly CatalogDbContext _context;

    public InternalTenantDataController(CatalogDbContext context)
    {
        _context = context;
    }

    [HttpDelete("{tenantId:guid}")]
    public async Task<IActionResult> DeleteByTenant(Guid tenantId, CancellationToken ct)
    {
        var products = await _context.Products
            .IgnoreQueryFilters()
            .Where(p => p.TenantId == tenantId)
            .ToListAsync(ct);

        var categories = await _context.Categories
            .IgnoreQueryFilters()
            .Where(c => c.TenantId == tenantId)
            .ToListAsync(ct);

        if (products.Count > 0)
        {
            _context.Products.RemoveRange(products);
        }

        if (categories.Count > 0)
        {
            _context.Categories.RemoveRange(categories);
        }

        await _context.SaveChangesAsync(ct);

        return Ok(new
        {
            deletedProducts = products.Count,
            deletedCategories = categories.Count
        });
    }
}
