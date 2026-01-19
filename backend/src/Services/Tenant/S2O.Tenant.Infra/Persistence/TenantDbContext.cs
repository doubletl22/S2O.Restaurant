using Microsoft.EntityFrameworkCore;
using S2O.Shared.Infra.Data;
using S2O.Shared.Kernel.Interfaces;
using S2O.Tenant.Domain.Entities;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.Infra.Persistence;

public class TenantDbContext : BaseDbContext, ITenantDbContext
{
    public TenantDbContext(DbContextOptions<TenantDbContext> options, ITenantContext tenantContext)
        : base(options, tenantContext)
    {
    }

    public DbSet<Domain.Entities.Tenant> Tenants { get; set; }
    public DbSet<Table> Tables { get; set; }
    public DbSet<Branch> Branches { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Table>().HasKey(x => x.Id);
        modelBuilder.Entity<Domain.Entities.Tenant>().HasKey(x => x.Id);
        modelBuilder.Entity<Branch>().HasKey(x => x.Id);
    }
}