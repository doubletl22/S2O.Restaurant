using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.Infra.Persistence; // Hoặc dùng MediatR nếu đã có Query

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/storefront/tenants")]
[ApiController]
public class StorefrontTenantController : ControllerBase
{
    private readonly TenantDbContext _context; // Demo dùng trực tiếp DbContext cho nhanh, tốt nhất nên dùng MediatR Query

    public StorefrontTenantController(TenantDbContext context)
    {
        _context = context;
    }

    // GET: api/v1/storefront/tenants/resolve-table/{tableId}
    [HttpGet("resolve-table/{tableId}")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<IActionResult> ResolveTable(Guid tableId)
    {
        var table = await _context.Tables.AsNoTracking().FirstOrDefaultAsync(t => t.Id == tableId);
        if (table == null) return NotFound("Không tìm thấy bàn.");

        var tenant = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == table.TenantId);
        if (tenant == null) return NotFound("Lỗi dữ liệu quán.");

        return Ok(new
        {
            TableId = table.Id,
            TableName = table.Name,
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            BranchId = table.BranchId ?? Guid.Empty
        });
    }
}