using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Application.Common.Interfaces;
using S2O.Services.Identity.Domain.Entities;

namespace S2O.Services.Identity.Infrastructure.Data
{
    public class IdentityDbContext : DbContext, IApplicationDbContext
    {
        public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}