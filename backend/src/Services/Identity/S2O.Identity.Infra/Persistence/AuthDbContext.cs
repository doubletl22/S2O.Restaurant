namespace S2O.Identity.Infra.Persistence;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Infra.Data;
using S2O.Shared.Interfaces;

public class AuthDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>
{
    private readonly ITenantContext _tenantContext;

    public AuthDbContext(DbContextOptions<AuthDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Áp dụng bộ lọc Tenant cho User
        builder.Entity<ApplicationUser>().HasQueryFilter(u => u.TenantId == _tenantContext.TenantId);
    }
}