using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities;
using S2O.Shared.Infra.Data; // Sử dụng BaseDbContext từ Shared Kernel
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Order.Infra.Persistence;

public class OrderDbContext : BaseDbContext, IOrderDbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options, ITenantContext tenantContext)
        : base(options, tenantContext)
    {
    }

    public DbSet<Domain.Entities.Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Cấu hình Order
        builder.Entity<Domain.Entities.Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TenantId); // Index để query nhanh theo Tenant

            // Relation 1-n
            entity.HasMany(e => e.Items)
                  .WithOne(e => e.Order)
                  .HasForeignKey(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Cấu hình OrderItem
        builder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Lưu chính xác độ chính xác của tiền tệ
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
        });
    }
}