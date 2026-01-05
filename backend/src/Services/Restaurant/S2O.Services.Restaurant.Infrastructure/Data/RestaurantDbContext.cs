using Microsoft.EntityFrameworkCore;
using S2O.Services.Restaurant.Domain.Entities;

namespace S2O.Services.Restaurant.Infrastructure.Data
{
    public class RestaurantDbContext : DbContext
    {
        public RestaurantDbContext(DbContextOptions<RestaurantDbContext> options) : base(options) { }

        public DbSet<Domain.Entities.Restaurant> Restaurants { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Dish> Dishes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Config Dish
            modelBuilder.Entity<Dish>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Price).HasColumnType("decimal(18,2)");
                e.HasIndex(x => x.RestaurantId); // Index để query nhanh theo nhà hàng

                // Quan hệ 1 Category - N Dish
                e.HasOne<Category>()
                 .WithMany(c => c.Dishes)
                 .HasForeignKey(x => x.CategoryId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // 2. Config Category
            modelBuilder.Entity<Category>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.RestaurantId);
            });
        }
    }
}