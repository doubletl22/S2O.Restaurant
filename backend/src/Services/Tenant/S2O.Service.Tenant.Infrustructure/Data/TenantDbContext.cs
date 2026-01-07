using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using S2O.Services.Tenants.Domain.Entities;

namespace S2O.Services.Tenants.Infrastructure.Data
{
    public class TenantDbContext : DbContext
    {
        public TenantDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<TenantRole> TenantRoles => Set<TenantRole>();
        public DbSet<TenantUser> TenantUsers => Set<TenantUser>();
        public DbSet<TenantUserRole> TenantUserRoles => Set<TenantUserRole>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TenantUserRole>()
                .HasKey(x => new { x.TenantUserId, x.TenantRoleId });
        }
    }
}
