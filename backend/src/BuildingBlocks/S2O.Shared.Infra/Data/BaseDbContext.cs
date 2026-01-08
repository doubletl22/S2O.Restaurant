// File: BuildingBlocks/S2O.Shared.Infra/Data/BaseDbContext.cs
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Interfaces;
using S2O.Shared.Kernel.Primitives;
using System.Linq.Expressions;

namespace S2O.Shared.Infra.Data;

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

        // Tự động áp dụng bộ lọc Tenant cho tất cả thực thể có ITenantEntity [cite: 32]
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var body = Expression.Equal(
                    Expression.Property(parameter, nameof(ITenantEntity.TenantId)),
                    Expression.Property(Expression.Constant(this), nameof(_tenantId))
                );
                var lambda = Expression.Lambda(body, parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }

    // Thuộc tính hỗ trợ cho Query Filter
    private string? _tenantId => _tenantContext.TenantId;
}