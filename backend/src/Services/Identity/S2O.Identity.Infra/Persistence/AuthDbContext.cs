namespace S2O.Identity.Infra.Persistence;
using S2O.Identity.App.Abstractions;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Infra.Data;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Kernel.Interfaces;

public class AuthDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IAuthDbContext
{
    private readonly ITenantContext _tenantContext;

    public AuthDbContext(DbContextOptions<AuthDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }
    public new DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<Branch> Branches { get; set; }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Áp dụng bộ lọc Tenant cho User
        builder.Entity<ApplicationUser>().HasQueryFilter(u => u.TenantId == _tenantContext.TenantId);
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.TenantId)
                  .IsRequired(false);
        });

    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Lấy Interceptor từ DI Container
        //optionsBuilder.AddInterceptors(this.GetService<UpdateAuditableEntitiesInterceptor>());
        base.OnConfiguring(optionsBuilder);
    }
}