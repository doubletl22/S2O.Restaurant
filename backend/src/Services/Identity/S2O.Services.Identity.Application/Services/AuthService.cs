using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;

namespace S2O.Services.Identity.Application.Services
{
    public class AuthService : IAuthService
    {
        private const string DEFAULT_CUSTOMER_ROLE = "CUSTOMER";

        private readonly IUserRepository userRepository;
        private readonly IUserRoleRepository userRoleRepository;
        private readonly IRoleRepository roleRepository;
        private readonly IPermissionRepository permissionRepository;
        private readonly IRefreshTokenRepository refreshTokenRepository;
        //private readonly ITenantRepository tenantRepository;
        private readonly IPasswordHasher passwordHasher;
        private readonly ITokenService tokenService;

        public AuthService(
            IUserRepository userRepository,
            IUserRoleRepository userRoleRepository,
            IRoleRepository roleRepository,
            IPermissionRepository permissionRepository,
            IRefreshTokenRepository refreshTokenRepository,
            //ITenantRepository tenantRepository,
            IPasswordHasher passwordHasher,
            ITokenService tokenService)
        {
            this.userRepository = userRepository;
            this.userRoleRepository = userRoleRepository;
            this.roleRepository = roleRepository;
            this.permissionRepository = permissionRepository;
            this.refreshTokenRepository = refreshTokenRepository;
            //this.tenantRepository = tenantRepository;
            this.passwordHasher = passwordHasher;
            this.tokenService = tokenService;
        }

        // ===================== REGISTER (CUSTOMER ONLY) =====================
        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress)
        {
            if (request.Password != request.ConfirmPassword)
                throw new Exception("Mật khẩu xác nhận không khớp");


            var existingUser = await userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                throw new Exception("Email đã được sử dụng");


            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = passwordHasher.Hash(request.Password),
                TenantId = request.TenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };


            // Gán role mặc định: CUSTOMER
            var role = await roleRepository.GetRoleByNameAsync(DEFAULT_CUSTOMER_ROLE);
            if (role == null)
                throw new Exception("Role CUSTOMER chưa được khởi tạo");

            await userRepository.AddAsync(user);

            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                TenantId = request.TenantId
            };

            await userRoleRepository.AddAsync(userRole);

            var roles = new List<string> { role.Name };
            var permissions = await permissionRepository
                .GetPermissionsByRolesIdAsync(new List<Guid> { role.Id });

            var accessToken = tokenService.CreateAccessToken(user, roles, permissions);
            var refreshToken = tokenService.CreateRefreshToken(ipAddress);
            refreshToken.UserId = user.Id;

            await refreshTokenRepository.AddAsync(refreshToken);

            return new AuthResponse
            {
                UserId = user.Id,        
                UserName = user.UserName,
                TenantId = request.TenantId,
                Roles = roles,
                Permissions = permissions,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }

        // ===================== LOGIN =====================
        public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress)
        {
            var user = await userRepository.GetByEmailAsync(request.Email);
            if (user == null || !user.IsActive)
                throw new Exception("Email hoặc mật khẩu không đúng");

            if (!passwordHasher.Verify(request.Password, user.PasswordHash))
                throw new Exception("Email hoặc mật khẩu không đúng");

            var roles = await userRoleRepository.GetRolesAsync(user.Id, request.TenantId);
            if (!roles.Any())
                throw new Exception("User chưa được gán role");

            var roleNames = roles.Select(r => r.Name).ToList();
            var permissions = await permissionRepository
                .GetPermissionsByRolesIdAsync(roles.Select(r => r.Id).ToList());

            var accessToken = tokenService.CreateAccessToken(user, roleNames, permissions);
            var refreshToken = tokenService.CreateRefreshToken(ipAddress);
            refreshToken.UserId = user.Id;

            await refreshTokenRepository.AddAsync(refreshToken);

            return new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                TenantId = request.TenantId,
                Roles = roleNames,
                Permissions = permissions,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }

        // ===================== REFRESH TOKEN =====================
        public async Task<AuthResponse> RefreshTokenAsync(string token, string ipAddress)
        {
            var oldToken = await refreshTokenRepository.GetByTokenAsync(token);
            if (oldToken == null || !oldToken.IsActive)
                throw new Exception("Refresh token không hợp lệ");

            var user = await userRepository.GetByIdAsync(oldToken.UserId);
            if (user == null || !user.IsActive)
                throw new Exception("User không hợp lệ");

            var roles = await userRoleRepository.GetRolesAsync(user.Id, user.TenantId);
            var roleNames = roles.Select(r => r.Name).ToList();

            var permissions = await permissionRepository
                .GetPermissionsByRolesIdAsync(roles.Select(r => r.Id).ToList());

            var newAccessToken = tokenService.CreateAccessToken(user, roleNames, permissions);

            oldToken.Revoked = DateTime.UtcNow;
            oldToken.RevokedByIp = ipAddress;

            var newRefreshToken = tokenService.CreateRefreshToken(ipAddress);
            newRefreshToken.UserId = user.Id;
            oldToken.ReplacedByToken = newRefreshToken.Token;

            await refreshTokenRepository.UpdateAsync(oldToken);
            await refreshTokenRepository.AddAsync(newRefreshToken);

            return new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                TenantId = user.TenantId ?? Guid.Empty,
                Roles = roleNames,
                Permissions = permissions,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }

        // ===================== LOGOUT =====================
        public async Task LogoutAsync(string refreshToken, string ipAddress)
        {
            var token = await refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (token == null || !token.IsActive)
                return;

            token.Revoked = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;

            await refreshTokenRepository.UpdateAsync(token);
        }
    }
}
