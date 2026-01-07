using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using S2O.Services.Identity.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Infrastructure.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppIdentityDbContext _dbContext;

        public RefreshTokenRepository(AppIdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(RefreshToken refreshToken)
        {
            _dbContext.RefreshTokens.Add(refreshToken);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.Token == token);
        }

        public async Task RevokeAllForUserAsync(Guid userId, Guid tenantId, string? ip = null)
        {
            var token = await _dbContext.RefreshTokens
                .Where(x => x.UserId == userId 
                && x.TenantId == tenantId 
                && x.RevokedAt == null)
                .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.RevokedAt, DateTime.UtcNow)
                .SetProperty(t => t.RevokedByIp, ip));
        
            await _dbContext.SaveChangesAsync();
        }

        public async Task RevokeAsync(RefreshToken token, string? ip = null, string? replaceByToken = null)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ip;
            token.ReplacedByToken = replaceByToken;
            _dbContext.RefreshTokens.Update(token);
            await _dbContext.SaveChangesAsync();
        }
    }
}
