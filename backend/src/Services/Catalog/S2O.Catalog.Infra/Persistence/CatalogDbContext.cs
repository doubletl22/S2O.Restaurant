using Microsoft.EntityFrameworkCore;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Interfaces;
using S2O.Catalog.App.Abstractions;

namespace S2O.Catalog.Infra.Persistence;

public class CatalogDbContext : DbContext, ICatalogDbContext
{
    private readonly ITenantContext _tenantContext;

    public CatalogDbContext(DbContextOptions<CatalogDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Áp dụng Query Filter cho Multi-tenancy
        builder.Entity<Product>().HasQueryFilter(p => p.TenantId == _tenantContext.TenantId);
        builder.Entity<Category>().HasQueryFilter(c => c.TenantId == _tenantContext.TenantId);

        // Cấu hình Fluent API cho Price
        builder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
    }
}