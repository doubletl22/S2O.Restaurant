using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Application.Common.Interfaces;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using S2O.Shared.Kernel.Wrapper;
using LoginRequest = S2O.Services.Identity.Application.DTOs.LoginRequest;
using RegisterRequest = S2O.Services.Identity.Application.DTOs.RegisterRequest;

namespace S2O.Services.Identity.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        public AuthService(IApplicationDbContext context, IPasswordHasher passwordHasher, ITokenService tokenService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, string ipAddress)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return Result<AuthResponse>.Failure("Email đã tồn tại.");

            var passwordHash = _passwordHasher.Hash(request.Password);
            var roleToUse = string.IsNullOrEmpty(request.Role) ? "Customer" : request.Role;

            var userResult = User.Create(request.UserName, request.Email, passwordHash, roleToUse);
            if (userResult.IsFailure) return Result<AuthResponse>.Failure(userResult.Error);

            var user = userResult.Value;
            _context.Users.Add(user);
            await _context.SaveChangesAsync(CancellationToken.None);

            return await GenerateAuthResponseAsync(user, ipAddress);
        }

        public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, string ipAddress)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
                return Result<AuthResponse>.Failure("Email hoặc mật khẩu không đúng.");

            return await GenerateAuthResponseAsync(user, ipAddress);
        }

        public async Task<Result<AuthResponse>> RefreshTokenAsync(string token, string ipAddress)
        {
            var oldToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == token);

            if (oldToken == null || !oldToken.IsActive)
                return Result<AuthResponse>.Failure("Refresh token không hợp lệ hoặc đã hết hạn.");

            // --- SỬA LỖI CS1503 TẠI ĐÂY ---
            // Vì oldToken.UserId đã là Guid nên lấy trực tiếp, không cần TryParse
            var userId = oldToken.UserId;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Result<AuthResponse>.Failure("User không tồn tại.");

            oldToken.IsRevoked = true;
            // oldToken.RevokedByIp = ipAddress; 

            await _context.SaveChangesAsync(CancellationToken.None);
            return await GenerateAuthResponseAsync(user, ipAddress);
        }

        public async Task<Result> LogoutAsync(string refreshToken, string ipAddress)
        {
            var token = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == refreshToken);

            if (token == null || !token.IsActive)
                return Result.Failure("Token không tồn tại hoặc đã hết hạn.");

            token.IsRevoked = true;
            // token.RevokedByIp = ipAddress;

            await _context.SaveChangesAsync(CancellationToken.None);
            return Result.Success();
        }

        private async Task<Result<AuthResponse>> GenerateAuthResponseAsync(User user, string ip)
        {
            var accessToken = _tokenService.CreateAccessToken(user);
            var refreshToken = _tokenService.CreateRefreshToken(ip);

            // --- SỬA LỖI LOGIC GÁN ---
            // Gán trực tiếp Guid, không dùng ToString() nữa
            refreshToken.UserId = user.Id;

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync(CancellationToken.None);

            return Result<AuthResponse>.Success(new AuthResponse
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Role = user.Role,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            });
        }
    }
}