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

    // GET: api/v1/storefront/tenants/resolve-table/{token}
    // token can be: tableId GUID, qr token GUID, or a full QR URL containing the token
    [HttpGet("resolve-table/{token}")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<IActionResult> ResolveTable(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest("Token không hợp lệ.");

        token = token.Trim();
        var parsedGuid = Guid.Empty;
        var hasGuid = Guid.TryParse(token, out parsedGuid);

            var table = await _context.Tables
                .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t =>
                (hasGuid && t.Id == parsedGuid) ||
                (t.QrCodeUrl != null && (
                    t.QrCodeUrl == token ||
                    t.QrCodeUrl.EndsWith(token) ||
                    t.QrCodeUrl.Contains($"/guest/t/{token}")
                ))
            );

        if (table == null) return NotFound("Không tìm thấy bàn.");

        // Fallback for legacy data: some old tables were created without TenantId.
        // Resolve tenant through BranchId to keep QR flow working.
        var resolvedTenantId = table.TenantId;
        string? resolvedTenantName = null;

        if (resolvedTenantId == null && table.BranchId != null)
        {
            var branchTenant = await _context.Branches
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(b => b.Id == table.BranchId)
                .Select(b => new { b.TenantId, b.Name })
                .FirstOrDefaultAsync();

            resolvedTenantId = branchTenant?.TenantId;
            resolvedTenantName = branchTenant?.Name;

            // Self-heal the table record for subsequent scans.
            if (resolvedTenantId != null)
            {
                table.TenantId = resolvedTenantId;
                await _context.SaveChangesAsync();
            }
        }

        if (resolvedTenantId == null) return NotFound("Lỗi dữ liệu quán.");

        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == resolvedTenantId);

        resolvedTenantName ??= tenant?.Name;

        return Ok(new
        {
            TableId = table.Id,
            TableName = table.Name,
            TenantId = resolvedTenantId.Value,
            TenantName = resolvedTenantName ?? string.Empty,
            BranchId = table.BranchId ?? Guid.Empty,
            IsOccupied = table.IsOccupied,
            ScannedAtUtc = DateTime.UtcNow
        });
    }
}