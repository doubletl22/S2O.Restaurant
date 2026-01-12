using Microsoft.EntityFrameworkCore;
using S2O.Payment.App.Abstractions;
using S2O.Payment.Domain.Entities;
using S2O.Shared.Infra.Data;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Payment.Infra.Persistence;

public class PaymentDbContext : BaseDbContext, IPaymentDbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options, ITenantContext tenantContext)
        : base(options, tenantContext)
    {
    }

    public DbSet<PaymentTransaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderId); // Index để tìm nhanh theo đơn hàng
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasConversion<string>();
        });
    }
}