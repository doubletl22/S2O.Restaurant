using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Shared.Kernel.Primitives; 
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Shared.Infra.Interceptors;

public class UpdateAuditableEntitiesInterceptor : SaveChangesInterceptor
{
    private readonly IUserContext _userContext; // 1. Thêm biến này

    public UpdateAuditableEntitiesInterceptor(IUserContext userContext)
    {
        _userContext = userContext; // 2. Inject vào Constructor
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateEntities(DbContext? context)
    {
        if (context == null) return;

        // 3. Quan trọng: Kiểm tra thực thể có phải là IAuditableEntity không (chứ không phải IMustHaveTenant)
        foreach (var entry in context.ChangeTracker.Entries<IAuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = DateTime.UtcNow;
                entry.Entity.CreatedBy = _userContext.UserId?.ToString();
            }

            if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
            {
                entry.Entity.LastModifiedAtUtc = DateTime.UtcNow;
                entry.Entity.LastModifiedBy = _userContext.UserId?.ToString();
            }
        }
    }
}