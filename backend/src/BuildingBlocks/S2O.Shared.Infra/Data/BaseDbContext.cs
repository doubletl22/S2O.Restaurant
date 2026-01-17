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

    // Getter cho Expression Tree dùng (EF Core gọi cái này mỗi lần query)
    public Guid? CurrentTenantId => _tenantContext.TenantId;
    public Guid? CurrentBranchId => _tenantContext.BranchId; // Mới

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;

            // Tạo Parameter expression "e => ..."
            var parameter = Expression.Parameter(clrType, "e");

            // --- Filter Tenant ---
            if (typeof(IMustHaveTenant).IsAssignableFrom(clrType))
            {
                // e.TenantId == this.CurrentTenantId
                var tenantFilter = Expression.Equal(
                    Expression.Property(parameter, nameof(IMustHaveTenant.TenantId)),
                    Expression.Property(Expression.Constant(this), nameof(CurrentTenantId))
                );

                // Nếu Entity CŨNG implement IMustHaveBranch, ta cần filter kết hợp (AND)
                if (typeof(IMustHaveBranch).IsAssignableFrom(clrType))
                {
                    // e.BranchId == this.CurrentBranchId
                    var branchFilter = Expression.Equal(
                        Expression.Property(parameter, nameof(IMustHaveBranch.BranchId)),
                        Expression.Property(Expression.Constant(this), nameof(CurrentBranchId))
                    );

                    // e.TenantId == CurrentTenantId && e.BranchId == CurrentBranchId
                    // Lưu ý: Filter Branch quan trọng hơn, nhưng Tenant giữ lại để safety
                    var combinedFilter = Expression.AndAlso(tenantFilter, branchFilter);

                    modelBuilder.Entity(clrType).HasQueryFilter(Expression.Lambda(combinedFilter, parameter));
                }
                else
                {
                    // Chỉ filter theo Tenant (ví dụ: Category, Product dùng chung)
                    modelBuilder.Entity(clrType).HasQueryFilter(Expression.Lambda(tenantFilter, parameter));
                }
            }
            // Trường hợp hiếm: Chỉ có Branch mà không có Tenant (ít gặp nhưng cứ handle)
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