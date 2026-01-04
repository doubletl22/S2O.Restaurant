using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Services.Ordering.Domain.Entities;
using S2O.Services.Ordering.Domain.Enums;

namespace S2O.Services.Ordering.Infrastructure.Data
{
    public class OrderingDbContext : DbContext
    {
        private readonly ISaveChangesInterceptor _auditableEntityInterceptor;

        public OrderingDbContext(DbContextOptions<OrderingDbContext> options, ISaveChangesInterceptor interceptor)
            : base(options)
        {
            _auditableEntityInterceptor = interceptor;
        }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            => optionsBuilder.AddInterceptors(_auditableEntityInterceptor);

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Order>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Status).HasConversion<string>(); // Lưu Enum dạng chữ
                e.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<OrderItem>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
                e.HasOne(x => x.Order)
                 .WithMany(o => o.Items)
                 .HasForeignKey(x => x.OrderId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}