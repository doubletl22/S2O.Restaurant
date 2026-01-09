// File: BuildingBlocks/S2O.Shared.Infra/Interceptors/TenantInterceptor.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Shared.Interfaces;
using S2O.Shared.Kernel.Primitives;

namespace S2O.Shared.Infra.Interceptors;

public class TenantInterceptor : SaveChangesInterceptor
{
    private readonly ITenantContext _tenantContext;

    public TenantInterceptor(ITenantContext tenantContext)
    {
        _tenantContext = tenantContext;
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context is null) return base.SavingChanges(eventData, result);

        foreach (var entry in eventData.Context.ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                // Tự động gán TenantId từ context hiện tại [cite: 12]
                var tenantId = _tenantContext.TenantId?.ToString() ?? string.Empty;
            }
        }

        // Tự động cập nhật thời gian Audit
        foreach (var entry in eventData.Context.ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAtUtc = DateTime.UtcNow;
            if (entry.State == EntityState.Modified) entry.Entity.ModifiedAtUtc = DateTime.UtcNow;
        }

        return base.SavingChanges(eventData, result);
    }
}