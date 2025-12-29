using S2O.Services.Identity.Application.DTOs;


namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IAuthService
    { 
        Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress);
        Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress);
        Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress);
        Task LogoutAsync(string refreshToken, string ipAddress);
    }
}
