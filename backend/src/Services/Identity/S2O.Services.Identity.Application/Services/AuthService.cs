using Microsoft.Extensions.Logging;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Services
{
    public class AuthService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IUserRoleRepository userRoleRepository,
        IPermissionRepository permissionRepository,
        ITenantRepository tenantRepository,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        IRefreshTokenRepository refreshTokenRepository
            ) : IAuthService
    {
        private readonly IUserRepository userRepository = userRepository;
        private readonly IRoleRepository roleRepository = roleRepository;
        private readonly IUserRoleRepository userRoleRepository = userRoleRepository;
        private readonly IPermissionRepository permissionRepository = permissionRepository;
        private readonly ITenantRepository tenantRepository = tenantRepository;
        private readonly ITokenService tokenService = tokenService;
        private readonly IPasswordHasher passwordHasher = passwordHasher;
        private readonly IRefreshTokenRepository refreshTokenRepository = refreshTokenRepository;

        public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress)
        {
            var user = await userRepository.FindByEmailAsync(request.Email);
            if (user == null || !user.IsActive || !passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                throw new Exception("Email hoặc mật khẩu không đúng");
            }

            var roles = await userRoleRepository.GetRolesAsync(user.Id, request.TenantId);

            if (!roles.Any())
            {
                throw new Exception("User chưa được gán role");
            }

            var rolesName = roles.Select(r => r.Name).ToList();

            var permissions = await permissionRepository.GetPermissionsByRolesIdAsync(roles.Select(r => r.Id).ToList());

            var accessToken = tokenService.CreateAccessToken(user, rolesName, permissions);

            var refreshToken = tokenService.CreateRefreshToken(ipAddress);

            refreshToken.UserId = user.Id;

            await refreshTokenRepository.AddAsync(refreshToken);

            return new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                TenantId = request.TenantId,
                Roles = rolesName,
                Permissions = permissions,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }

        public Task LogoutAsync(string refreshToken)
        {
            throw new NotImplementedException();
        }

        public Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress)
        {
            throw new NotImplementedException();
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress)
        {
            var tenant = await tenantRepository.GetByIdAsync(request.TenantId);
            if (tenant == null || tenant.Status != "Active")
            {
                throw new Exception("Tenant không hợp lệ");
            }

            var exitingUser = await userRepository.FindByEmailAsync(request.Email);
            if (exitingUser == null)
            {
                throw new Exception("Email đã tồn tại");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = passwordHasher.Hash(request.Password),
                TenantId = request.TenantId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };
            throw new Exception();

        }
    }
}
