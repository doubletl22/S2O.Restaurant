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

        // MVP phiên bàn: khi khách quét QR lần đầu thì đánh dấu bàn đang có khách.
        // Các lần quét tiếp theo vẫn cho vào menu nhưng giữ nguyên trạng thái bàn.
        if (!table.IsOccupied)
        {
            table.IsOccupied = true;
            await _context.SaveChangesAsync();
        }

            var tenant = await _context.Tenants
                .IgnoreQueryFilters()
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == table.TenantId);
        if (tenant == null) return NotFound("Lỗi dữ liệu quán.");

        return Ok(new
        {
            TableId = table.Id,
            TableName = table.Name,
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            BranchId = table.BranchId ?? Guid.Empty,
            IsOccupied = table.IsOccupied,
            ScannedAtUtc = DateTime.UtcNow
        });
    }
}