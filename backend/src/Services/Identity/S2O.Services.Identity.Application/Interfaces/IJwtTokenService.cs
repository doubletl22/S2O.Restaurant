using S2O.Services.Identity.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IJwtTokenService
    {
        public string GenerateAccessToken(Guid userId, Guid tenantId, string role);
        public AuthResponseDto GenerateAuthResponse(Guid userId, Guid tenantId, string role);
        public string GenerateRefreshToken();
        public int GetAccessTokenLifetimeMinutes(); 
        public int GetRefreshTokenLifetimeDays();
    }
}
