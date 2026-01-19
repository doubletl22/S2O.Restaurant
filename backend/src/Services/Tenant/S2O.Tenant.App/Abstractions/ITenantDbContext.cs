using Microsoft.EntityFrameworkCore;
using S2O.Tenant.Domain.Entities;

namespace S2O.Tenant.App.Abstractions;

public interface ITenantDbContext
{
    DbSet<Domain.Entities.Tenant> Tenants { get; }
    DbSet<Table> Tables { get; }
    DbSet<Branch> Branches { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}