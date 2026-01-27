using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.Infra.Persistence; 

namespace S2O.Tenant.Api.Controllers;

[ApiController]
[Route("api/public/tenant")]
public class PublicTenantController : ControllerBase
{
    private readonly TenantDbContext _context;

    public PublicTenantController(TenantDbContext context)
    {
        _context = context;
    }

    // API: GET /api/public/tenant/resolve-table/{tableId}
    [HttpGet("resolve-table/{tableId}")]
    [AllowAnonymous]
    public async Task<IActionResult> ResolveTable(Guid tableId)
    {
        // 1. Tìm bàn trong Database Tenant
        var table = await _context.Tables
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tableId);

        if (table == null)
            return NotFound("Không tìm thấy bàn này.");

        // 2. Tìm thông tin quán
        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == table.TenantId);

        if (tenant == null)
            return NotFound("Lỗi dữ liệu quán.");

        // 3. Trả về TenantId để Frontend dùng gọi Menu
        return Ok(new
        {
            TableId = table.Id,
            TableName = table.Name,
            TenantId = tenant.Id,
            TenantName = tenant.Name
        });
    }
}