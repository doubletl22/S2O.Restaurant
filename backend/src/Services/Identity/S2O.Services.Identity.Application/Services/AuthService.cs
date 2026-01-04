using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Identity.Application.Services
{
    public class AuthService : IAuthService
    {
        // 1. Khai báo Fields (Biến)
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        // 2. Constructor (Hàm khởi tạo để tiêm các dependencies vào)
        public AuthService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IPasswordHasher passwordHasher,
            ITokenService tokenService)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        // ===================== REGISTER =====================
        public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, string ip)
        {
            if (request.Password != request.ConfirmPassword)
                return Result<AuthResponse>.Failure("Mật khẩu xác nhận không khớp");

            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                return Result<AuthResponse>.Failure("Email đã được sử dụng");

            // Hash password
            var passwordHash = _passwordHasher.Hash(request.Password);

            // Tạo User bằng Factory Method (Domain Logic)
            var userResult = User.Create(request.UserName, request.Email, passwordHash);
            if (userResult.IsFailure)
                return Result<AuthResponse>.Failure(userResult.Error);

            var user = userResult.Value;

            // Lưu vào DB
            await _userRepository.AddAsync(user);

            // Tạo Token
            var accessToken = _tokenService.CreateAccessToken(user);
            var refreshToken = _tokenService.CreateRefreshToken(ip);
            refreshToken.UserId = user.Id;

            await _refreshTokenRepository.AddAsync(refreshToken);

            return Result<AuthResponse>.Success(new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            });
        }

        // ===================== LOGIN =====================
        public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, string ip)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
                return Result<AuthResponse>.Failure("Email hoặc mật khẩu không đúng");

            var accessToken = _tokenService.CreateAccessToken(user);
            var refreshToken = _tokenService.CreateRefreshToken(ip);
            refreshToken.UserId = user.Id;

            await _refreshTokenRepository.AddAsync(refreshToken);

            return Result<AuthResponse>.Success(new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            });
        }

        // ===================== REFRESH TOKEN =====================
        public async Task<Result<AuthResponse>> RefreshTokenAsync(string token, string ipAddress)
        {
            var oldToken = await _refreshTokenRepository.GetByTokenAsync(token);
            if (oldToken == null || !oldToken.IsActive)
                return Result<AuthResponse>.Failure("Refresh token không hợp lệ");

            var user = await _userRepository.GetByIdAsync(oldToken.UserId);
            if (user == null || !user.IsActive)
                return Result<AuthResponse>.Failure("User không hợp lệ");

            var newAccessToken = _tokenService.CreateAccessToken(user);

            // Revoke token cũ
            oldToken.Revoked = DateTime.UtcNow;
            oldToken.RevokedByIp = ipAddress;

            // Tạo token mới
            var newRefreshToken = _tokenService.CreateRefreshToken(ipAddress);
            newRefreshToken.UserId = user.Id;
            oldToken.ReplacedByToken = newRefreshToken.Token;

            await _refreshTokenRepository.UpdateAsync(oldToken);
            await _refreshTokenRepository.AddAsync(newRefreshToken);

            return Result<AuthResponse>.Success(new AuthResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token,
            });
        }

        // ===================== LOGOUT =====================
        public async Task<Result> LogoutAsync(string refreshToken, string ipAddress)
        {
            var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (token == null || !token.IsActive)
                return Result.Failure("Token không tồn tại hoặc đã hết hạn");

            token.Revoked = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;

            await _refreshTokenRepository.UpdateAsync(token);

            return Result.Success();
        }
    }
}