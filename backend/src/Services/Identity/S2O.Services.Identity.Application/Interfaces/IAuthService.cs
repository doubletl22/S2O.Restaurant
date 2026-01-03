using S2O.Services.Identity.Application.DTOs;
using S2O.Shared.Kernel.Wrapper; // Nhớ dòng này

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IAuthService
    {
        Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, string ip);
        Task<Result<AuthResponse>> LoginAsync(LoginRequest request, string ip);
        Task<Result<AuthResponse>> RefreshTokenAsync(string token, string ipAddress);
        Task<Result> LogoutAsync(string refreshToken, string ipAddress); 
    }
}