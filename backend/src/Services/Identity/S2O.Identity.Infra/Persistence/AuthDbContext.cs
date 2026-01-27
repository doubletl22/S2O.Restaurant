namespace S2O.Identity.Infra.Persistence;

using S2O.Identity.App.Abstractions;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;

public class AuthDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>, IAuthDbContext
{
    private readonly ITenantContext _tenantContext;

    public AuthDbContext(DbContextOptions<AuthDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public new DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<UserBranch> UserBranches { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.TenantId).IsRequired(false);
            entity.Property(u => u.BranchId).IsRequired(false); // BranchId cũng có thể null (vd: Admin)
        });
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    }
}