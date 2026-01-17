using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;

namespace S2O.Identity.App.Abstractions;

public interface IAuthDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<Branch> Branches { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}