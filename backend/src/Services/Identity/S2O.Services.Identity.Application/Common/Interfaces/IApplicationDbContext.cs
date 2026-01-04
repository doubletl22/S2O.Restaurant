using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Domain.Entities;

namespace S2O.Services.Identity.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; }
        DbSet<RefreshToken> RefreshTokens { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}