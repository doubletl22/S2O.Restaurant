using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase
{
    public class LogoutHandler
    {
        private readonly IRefreshTokenRepository _refreshToken;

        public LogoutHandler(IRefreshTokenRepository refreshToken)
        {
            _refreshToken = refreshToken;
        }

        public async Task<bool> HandleAsync(LogoutRequestDto dto, string? ip = null)
        {
            if(string.IsNullOrWhiteSpace(dto.RefreshToken))
            {
                return false;
            }

            var token = await _refreshToken.GetByTokenAsync(dto.RefreshToken);

            if (token is null || !token.IsActive)
            {
                return true;
            }

            await _refreshToken.RevokeAsync(token, ip);

            return true;
        }

    }
}
