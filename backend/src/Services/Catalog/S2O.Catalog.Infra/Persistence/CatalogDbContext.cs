using Microsoft.EntityFrameworkCore;
using S2O.Catalog.Domain.Entities;
using S2O.Catalog.App.Abstractions;
using S2O.Shared.Infra.Data;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Catalog.Infra.Persistence;

public class CatalogDbContext : BaseDbContext, ICatalogDbContext // Kế thừa BaseDbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options, ITenantContext tenantContext)
        : base(options, tenantContext) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Gọi base để kích hoạt tự động Query Filter từ BaseDbContext
        base.OnModelCreating(builder);

        builder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
    }
}