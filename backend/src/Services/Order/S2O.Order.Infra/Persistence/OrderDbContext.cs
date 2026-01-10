namespace S2O.Order.Infra.Persistence;

using Microsoft.EntityFrameworkCore;
using S2O.Order.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Order.App.Abstractions;

public class OrderDbContext : DbContext, IOrderDbContext
{
    private readonly ITenantContext _tenantContext;

    public OrderDbContext(DbContextOptions<OrderDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<Order>().HasQueryFilter(o => o.TenantId == _tenantContext.TenantId);
        builder.Entity<Order>().Property(o => o.TotalAmount).HasPrecision(18, 2);
        builder.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasPrecision(18, 2);
    }
}