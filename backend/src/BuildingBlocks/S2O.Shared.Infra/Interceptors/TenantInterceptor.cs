using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Shared.Kernel.Interfaces;
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

        var tracker = eventData.Context.ChangeTracker;

        foreach (var entry in tracker.Entries<IMustHaveTenant>())
        {
            if (entry.State == EntityState.Added && _tenantContext.TenantId.HasValue)
            {
                entry.Entity.TenantId = _tenantContext.TenantId.Value;
            }
        }

        foreach (var entry in tracker.Entries<IMustHaveBranch>())
        {
            if (entry.State == EntityState.Added && _tenantContext.BranchId.HasValue)
            {
                entry.Entity.BranchId = _tenantContext.BranchId.Value;
            }
        }

        foreach (var entry in tracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = DateTime.UtcNow;
            }
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.ModifiedAtUtc = DateTime.UtcNow;
            }
        }

        return base.SavingChanges(eventData, result);
    }
}