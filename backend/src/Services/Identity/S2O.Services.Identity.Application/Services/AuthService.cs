using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;

namespace S2O.Services.Identity.Application.Services
{
    public class AuthService : IAuthService
    {
        private const string DEFAULT_CUSTOMER_ROLE = "CUSTOMER";

        private readonly IUserRepository userRepository;
        private readonly IRefreshTokenRepository refreshTokenRepository;
        private readonly IPasswordHasher passwordHasher;
        private readonly ITokenService tokenService;

        public AuthService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IPasswordHasher passwordHasher,
            ITokenService tokenService)
        {
            this.userRepository = userRepository;
            this.refreshTokenRepository = refreshTokenRepository;
            this.passwordHasher = passwordHasher;
            this.tokenService = tokenService;
        }

        // ===================== REGISTER (CUSTOMER ONLY) =====================
        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ip)
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
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await userRepository.AddAsync(user);

            var accessToken = tokenService.CreateAccessToken(user);
            var refreshToken = tokenService.CreateRefreshToken(ip);
            refreshToken.UserId = user.Id;

            await refreshTokenRepository.AddAsync(refreshToken);

            return new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            };
        }



        // ===================== LOGIN =====================
        public async Task<AuthResponse> LoginAsync(LoginRequest request, string ip)
        {
            var user = await userRepository.GetByEmailAsync(request.Email);

            if (user == null || !passwordHasher.Verify(request.Password, user.PasswordHash))
                throw new Exception("Email hoặc mật khẩu không đúng");

            var accessToken = tokenService.CreateAccessToken(user);
            var refreshToken = tokenService.CreateRefreshToken(ip);
            refreshToken.UserId = user.Id;

            await refreshTokenRepository.AddAsync(refreshToken);

            return new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
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


            var newAccessToken = tokenService.CreateAccessToken(user );

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
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token,
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
