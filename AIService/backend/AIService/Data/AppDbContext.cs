using Microsoft.EntityFrameworkCore;

namespace S2O.AIService.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<DiningTable> Tables => Set<DiningTable>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<RestaurantDoc> RestaurantDocs => Set<RestaurantDoc>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Restaurant>()
            .HasIndex(x => new { x.TenantId, x.RestaurantId })
            .IsUnique();

        modelBuilder.Entity<MenuItem>()
            .HasIndex(x => new { x.TenantId, x.RestaurantId, x.Name });

        modelBuilder.Entity<DiningTable>()
            .HasIndex(x => new { x.TenantId, x.RestaurantId, x.TableNo })
            .IsUnique();

        modelBuilder.Entity<OrderItem>().HasIndex(x => x.OrderId);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
