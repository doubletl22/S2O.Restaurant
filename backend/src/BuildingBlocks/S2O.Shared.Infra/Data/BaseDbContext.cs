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

    public Guid? CurrentTenantId => _tenantContext.TenantId;
    public Guid? CurrentBranchId => _tenantContext.BranchId; 

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;

            var parameter = Expression.Parameter(clrType, "e");

            if (typeof(IMustHaveTenant).IsAssignableFrom(clrType))
            {
                var tenantFilter = Expression.Equal(
                    Expression.Property(parameter, nameof(IMustHaveTenant.TenantId)),
                    Expression.Property(Expression.Constant(this), nameof(CurrentTenantId))
                );

                if (typeof(IMustHaveBranch).IsAssignableFrom(clrType))
                {
                    // e.BranchId == this.CurrentBranchId
                    var branchFilter = Expression.Equal(
                        Expression.Property(parameter, nameof(IMustHaveBranch.BranchId)),
                        Expression.Property(Expression.Constant(this), nameof(CurrentBranchId))
                    );

                    // e.TenantId == CurrentTenantId && e.BranchId == CurrentBranchId
                    var combinedFilter = Expression.AndAlso(tenantFilter, branchFilter);

                    modelBuilder.Entity(clrType).HasQueryFilter(Expression.Lambda(combinedFilter, parameter));
                }
                else
                {
                    modelBuilder.Entity(clrType).HasQueryFilter(Expression.Lambda(tenantFilter, parameter));
                }
            }
            else if (typeof(IMustHaveBranch).IsAssignableFrom(clrType))
            {
                var branchFilter = Expression.Equal(
                    Expression.Property(parameter, nameof(IMustHaveBranch.BranchId)),
                    Expression.Property(Expression.Constant(this), nameof(CurrentBranchId))
                );
                modelBuilder.Entity(clrType).HasQueryFilter(Expression.Lambda(branchFilter, parameter));
            }
        }
    }
}