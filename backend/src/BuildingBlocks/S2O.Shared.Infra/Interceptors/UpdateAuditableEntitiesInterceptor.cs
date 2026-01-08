using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Shared.Interfaces;
using S2O.Shared.Infra.Interfaces;

public class UpdateAuditableEntitiesInterceptor : SaveChangesInterceptor
{
    private readonly ITenantContext _tenantContext;

    public UpdateAuditableEntitiesInterceptor(ITenantContext tenantContext)
    {
        _tenantContext = tenantContext;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        var dbContext = eventData.Context;
        if (dbContext is null) return base.SavingChanges(eventData, result);

        var entries = dbContext.ChangeTracker.Entries<IMustHaveTenant>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                if (string.IsNullOrEmpty(_tenantContext.TenantId))
                {
                    throw new InvalidOperationException("TenantId is missing in the current context.");
                }
                entry.Property(a => a.TenantId).CurrentValue = _tenantContext.TenantId;
            }
        }

        return base.SavingChanges(eventData, result);
    }
}