using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase
{
    public class RefreshAccessTokenHandler
    {
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly IUserRepository _users;
        private readonly IJwtTokenService _jwt;

        public RefreshAccessTokenHandler(
            IRefreshTokenRepository refreshRepo,
            IUserRepository users,
            IJwtTokenService jwt)
        {
            _refreshRepo = refreshRepo;
            _users = users;
            _jwt = jwt;
        }

        public async Task<AuthResponseDto?> HandleAsync(RefreshTokenRequestDto dto, string? ip = null)
        {
            var token = await _refreshRepo.GetByTokenAsync(dto.RefreshToken);
            if (token is null || !token.IsActive)
                return null;

            if (token.RevokedAt != null)
            {
                await _refreshRepo.RevokeAllForUserAsync(token.UserId, token.TenantId, ip);
            }

            if (token.ExpiresAt <= DateTime.UtcNow)
                return null;

            var user = await _users.GetByIdAsync(token.UserId);
            if (user == null || !user.IsActive)
                return null;

            var auth = _jwt.GenerateAuthResponse(user.Id, token.TenantId, user.Role);

            var newRefreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TenantId = token.TenantId,
                Token = auth.RefreshToken,
                ExpiresAt = auth.RefreshExpiresAt,
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ip
            };

            await _refreshRepo.RevokeAsync(token, ip, newRefreshToken.Token);
            await _refreshRepo.AddAsync(newRefreshToken);

            return auth;
        }
    }
}
