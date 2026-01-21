using Microsoft.EntityFrameworkCore;
using S2O.Booking.App.Abstractions;
using S2O.Booking.Infra.Data;

namespace S2O.Booking.Infra.Services;

public class TenantTableChecker : ITenantTableChecker
{
    private readonly TenantReadOnlyDbContext _tenantDb;

    public TenantTableChecker(TenantReadOnlyDbContext tenantDb)
    {
        _tenantDb = tenantDb;
    }

    public async Task<int?> GetTableCapacityAsync(Guid tableId, Guid branchId)
    {
        // Query trực tiếp sang Tenant DB
        var table = await _tenantDb.Tables
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tableId && t.BranchId == branchId);

        return table?.Capacity; // Trả về sức chứa hoặc null
    }
}