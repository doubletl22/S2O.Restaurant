using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;

namespace S2O.Identity.App.Abstractions;

public interface IAuthDbContext
{
    DbSet<UserBranch> UserBranches { get; }
    DbSet<ApplicationUser> Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}