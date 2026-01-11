using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Primitives;
using System.Linq.Expressions;

namespace S2O.Shared.Infra.Data;

public abstract class BaseDbContext : DbContext
{
    protected readonly ITenantContext _tenantContext;

    protected BaseDbContext(DbContextOptions options, ITenantContext tenantContext)
        : base(options) => _tenantContext = tenantContext;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            // Đổi từ ITenantEntity sang IMustHaveTenant cho đồng bộ với Product
            if (typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");

                // So sánh thuộc tính TenantId của Entity với CurrentTenantId của DbContext
                var body = Expression.Equal(
                    Expression.Property(parameter, nameof(IMustHaveTenant.TenantId)),
                    Expression.Property(Expression.Constant(this), nameof(CurrentTenantId))
                );
                var lambda = Expression.Lambda(body, parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }

    // EF Core sẽ gọi thuộc tính này mỗi khi thực thi truy vấn
    public Guid? CurrentTenantId => _tenantContext.TenantId;
}