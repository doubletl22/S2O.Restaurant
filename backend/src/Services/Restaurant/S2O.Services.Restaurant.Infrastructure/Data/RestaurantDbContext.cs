using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Services.Restaurant.Domain.Entities;

namespace S2O.Services.Restaurant.Infrastructure.Data
{
    public class RestaurantDbContext : DbContext
    {
        private readonly ISaveChangesInterceptor _interceptor;

        public RestaurantDbContext(DbContextOptions<RestaurantDbContext> options, ISaveChangesInterceptor interceptor)
            : base(options)
        {
            _interceptor = interceptor;
        }

        public DbSet<Domain.Entities.Restaurant> Restaurants { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Table> Tables { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            => optionsBuilder.AddInterceptors(_interceptor);

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<MenuItem>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Price).HasColumnType("decimal(18,2)");
                e.HasIndex(x => x.RestaurantId);
            });

            modelBuilder.Entity<Table>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.RestaurantId);
            });
        }
    }
}