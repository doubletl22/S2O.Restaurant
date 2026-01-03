
using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Domain.Entities;


namespace S2O.Services.Identity.Infrastructure.Data
{
    public class AppIdentityDbContext : DbContext
    {

        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options)
            : base(options) { }
        public DbSet<User> Users => Set<User>();
        public DbSet<UserTenant> UserTenants => Set<UserTenant>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        public DbSet<Tenant> Tenants => Set<Tenant>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<UserTenant>()
                .HasKey(ut => new { ut.UserId, ut.TenantId }); 
            modelBuilder.Entity<UserTenant>()
                .HasOne(ut => ut.User)
                .WithMany(u => u.Tenants)
                .HasForeignKey(ut => ut.UserId); 

            modelBuilder.Entity<UserTenant>()
                .HasOne(ut => ut.Tenant)
                .WithMany(t => t.Users)
                .HasForeignKey(ut => ut.TenantId);

            modelBuilder.Entity<RefreshToken>(b => { b.HasKey(rt => rt.Id); 
                b.Property(rt => rt.Token)
                .IsRequired()
                .HasMaxLength(500); 

                b.HasIndex(rt => rt.Token).IsUnique();
                b.HasIndex(rt => new { rt.UserId, rt.TenantId }); 
                b.HasOne<User>()
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

                b.HasOne<Tenant>()
                .WithMany()
                .HasForeignKey(rt => rt.TenantId)
                .OnDelete(DeleteBehavior.Cascade); 
            }); 

            modelBuilder.Entity<User>(b => { b.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255); 
                b.HasIndex(u => u.Email)
                .IsUnique(); 
            }); 
            
            modelBuilder.Entity<Tenant>(b => { b.Property(t => t.Code)
                .IsRequired()
                .HasMaxLength(100); 

                b.HasIndex(t => t.Code).IsUnique();
                b.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(255); 
            });
        }
    }
}
