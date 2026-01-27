using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace S2O.Identity.App.Abstractions;

public interface IAuthDbContext
{
    DbSet<ApplicationRole> Roles { get; }
    DbSet<IdentityUserRole<Guid>> UserRoles { get; }
    DbSet<UserBranch> UserBranches { get; }
    DbSet<ApplicationUser> Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}