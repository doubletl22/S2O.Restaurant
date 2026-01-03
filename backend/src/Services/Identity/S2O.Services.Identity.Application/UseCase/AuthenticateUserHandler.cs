using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;


namespace S2O.Services.Identity.Application.UseCase
{
    public class AuthenticateUserHandler
    {
        private readonly IFirebaseAuthService _firebase;
        private readonly IUserRepository _users;
        private readonly IUserTenantRepository _userTenants;
        private readonly IJwtTokenService _jwt;
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly ITenantRepository _tenants;

        public AuthenticateUserHandler(
            IFirebaseAuthService firebase,
            IUserRepository users,
            IUserTenantRepository userTenants,
            IJwtTokenService jwt,
            IRefreshTokenRepository refreshRepo,
            ITenantRepository tenants)
        {
            _firebase = firebase;
            _users = users;
            _userTenants = userTenants;
            _jwt = jwt;
            _refreshRepo = refreshRepo;
            _tenants = tenants;
        }

        public async Task<AuthResponseDto?> HandleAsync(LoginRequestDto dto, string? ip = null)
        {
            var firebaseUser = await _firebase.VerifyTokenAsync(dto.FirebaseIdToken);
            if (firebaseUser == null)
                throw new UnauthorizedAccessException("Firebase không hợp lệ");

            var user = await _users.GetByEmailAsync(firebaseUser.Email);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = firebaseUser.Email,
                    FullName = firebaseUser.FullName,
                    Role = "Customer",
                    IsActive = true,
                    Tenants = new List<UserTenant>()
                };
                await _users.AddAsync(user);
            }

            var tenant = await _tenants.GetByCodeAsync(dto.TenantCode);
            if (tenant == null)
                throw new UnauthorizedAccessException("Tenant không tồn tại");

            if (!await _userTenants.ExistsInTenantAsync(user.Id, tenant.Id))
            {
                await _userTenants.AddAsync(new UserTenant
                {
                    UserId = user.Id,
                    TenantId = tenant.Id
                });
            }

            var auth = _jwt.GenerateAuthResponse(user.Id, tenant.Id, user.Role);

            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TenantId = tenant.Id,
                Token = auth.RefreshToken,
                ExpiresAt = auth.RefreshExpiresAt,
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ip
            };

            await _refreshRepo.AddAsync(refreshToken);

            return auth;
        }
    }
}
