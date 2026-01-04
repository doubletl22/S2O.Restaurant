using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Services.Customer.Domain.Entities;

namespace S2O.Services.Customer.Infrastructure.Data
{
    public class CustomerDbContext : DbContext
    {
        private readonly ISaveChangesInterceptor _auditableEntityInterceptor;

        public CustomerDbContext(DbContextOptions<CustomerDbContext> options, ISaveChangesInterceptor interceptor) : base(options)
        {
            _auditableEntityInterceptor = interceptor;
        }

        public DbSet<Domain.Entities.Customer> Customers { get; set; }
        public DbSet<CustomerFavorite> CustomerFavorites { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            => optionsBuilder.AddInterceptors(_auditableEntityInterceptor);

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Domain.Entities.Customer>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.IdentityId).IsUnique();
                e.Property(x => x.Tier).HasConversion<string>(); // Lưu Enum dạng chữ
            });

            modelBuilder.Entity<CustomerFavorite>(e =>
            {
                e.HasKey(x => new { x.CustomerId, x.RestaurantId }); // Khóa chính phức hợp
                e.HasOne(x => x.Customer)
                 .WithMany(c => c.Favorites)
                 .HasForeignKey(x => x.CustomerId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CustomerVoucher>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Customer)
                 .WithMany(c => c.Vouchers)
                 .HasForeignKey(x => x.CustomerId);
            });

            // Config CustomerFeedback
            modelBuilder.Entity<CustomerFeedback>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Customer)
                 .WithMany(c => c.Feedbacks)
                 .HasForeignKey(x => x.CustomerId);
            });
        }
    }
}