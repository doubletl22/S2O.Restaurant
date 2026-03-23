using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using S2O.Payment.Infra.Persistence;

namespace S2O.Payment.Api.Controllers;

[Route("api/internal/tenant-data")]
[ApiController]
[Authorize(Roles = "SystemAdmin")]
public class InternalTenantDataController : ControllerBase
{
    private readonly PaymentDbContext _context;

    public InternalTenantDataController(PaymentDbContext context)
    {
        _context = context;
    }

    [HttpDelete("{tenantId:guid}")]
    public async Task<IActionResult> DeleteByTenant(Guid tenantId, CancellationToken ct)
    {
        try
        {
            var transactions = await _context.Transactions
                .IgnoreQueryFilters()
                .Where(t => t.TenantId == tenantId)
                .ToListAsync(ct);

            if (transactions.Count > 0)
            {
                _context.Transactions.RemoveRange(transactions);
                await _context.SaveChangesAsync(ct);
            }

            return Ok(new
            {
                deletedTransactions = transactions.Count
            });
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UndefinedTable)
        {
            // Older environments may not have Payment transaction table yet.
            // Treat as no data to delete so tenant cascade deletion can continue.
            return Ok(new
            {
                deletedTransactions = 0,
                skipped = true,
                reason = "Transactions table does not exist"
            });
        }
    }
}
