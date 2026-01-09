// File: S2O.Shared.Infra/BaseDbContext.cs
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Interfaces;
using S2O.Shared.Infra.Interfaces;

public abstract class BaseDbContext : DbContext
{
    protected readonly ITenantContext _tenantContext;

    protected BaseDbContext(DbContextOptions options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tự động áp dụng Filter cho tất cả các Entity có thực thi IMustHaveTenant
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(CreateTenantFilterExpression(entityType.ClrType));
            }
        }
    }

    private System.Linq.Expressions.LambdaExpression CreateTenantFilterExpression(Type type)
    {
        // Tạo biểu thức: e => e.TenantId == _tenantContext.TenantId
        var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(IMustHaveTenant.TenantId));
        var tenantContextValue = System.Linq.Expressions.Expression.Property(
            System.Linq.Expressions.Expression.Constant(this),
            nameof(_tenantContext));
        var tenantIdValue = System.Linq.Expressions.Expression.Property(tenantContextValue, nameof(ITenantContext.TenantId));

        var body = System.Linq.Expressions.Expression.Equal(property, tenantIdValue);
        return System.Linq.Expressions.Expression.Lambda(body, parameter);
    }
}