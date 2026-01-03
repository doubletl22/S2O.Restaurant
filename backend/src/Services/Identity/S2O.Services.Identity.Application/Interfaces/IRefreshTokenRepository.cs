using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task AddAsync(RefreshToken refreshToken);
        Task RevokeAsync(RefreshToken token, string? ip = null, string? replaceByToken = null);
        Task RevokeAllForUserAsync(Guid userId, Guid tenantId, string? ip = null);
    }
}

