using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System.Text.Json;


namespace S2O.Services.Identity.Application.UseCase
{
    public class PasswordLoginHandler
    {
        private readonly IUserRepository _users;
        private readonly IPasswordHasher _hasher;
        private readonly IJwtTokenService _jwt;
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly ITenantRepository _tenants;
        private readonly IUserTenantRepository _userTenants;

        public PasswordLoginHandler(IUserRepository users,
            IPasswordHasher hasher,
            IJwtTokenService jwt,
            IRefreshTokenRepository refreshRepo,
            ITenantRepository tenants,
            IUserTenantRepository userTenants)
        {
            _users = users;
            _hasher = hasher;
            _jwt = jwt;
            _refreshRepo = refreshRepo;
            _tenants = tenants;
            _userTenants = userTenants;
        }


        public async Task<AuthResponseDto?> HandlerAsync(LoginRequestDto dto, string? ip = null)
        {
            var user = await _users.GetByEmailAsync(dto.Email);
            if (user == null || !user.IsActive)
                return null;

            if (!_hasher.Verify(dto.Password, user.PasswordHash))
                return null;

            var tenant = await _tenants.GetByCodeAsync(dto.TenantCode);
            if (tenant == null)
                return null;

            if (!await _userTenants.ExistsInTenantAsync(user.Id, tenant.Id))
            {
                return null;
            }

            var authResponse = _jwt.GenerateAuthResponse(user.Id, tenant.Id, user.Role);
<<<<<<< HEAD
            var refreshToken =  new RefreshToken
=======
            await _refreshRepo.AddAsync(new RefreshToken
>>>>>>> f5342a11e7fc2e575843751d2d0873992823dccb
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Token = authResponse.RefreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwt.GetRefreshTokenLifetimeDays()),
                CreatedByIp = ip,
                CreatedAt = DateTime.UtcNow
<<<<<<< HEAD
            };

            await _refreshRepo.AddAsync(refreshToken);
=======
            });
>>>>>>> f5342a11e7fc2e575843751d2d0873992823dccb
            Console.WriteLine(JsonSerializer.Serialize(authResponse));
            return authResponse;
        }

    }
}
