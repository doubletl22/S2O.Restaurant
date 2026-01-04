using Microsoft.AspNetCore.Identity.Data;
using S2O.Services.Identity.Application.DTOs;
using S2O.Shared.Kernel.Wrapper;
using RegisterRequest = S2O.Services.Identity.Application.DTOs.RegisterRequest;
using LoginRequest = S2O.Services.Identity.Application.DTOs.LoginRequest; 

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IAuthService
    {
        Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, string ipAddress);
        Task<Result<AuthResponse>> LoginAsync(LoginRequest request, string ipAddress);
        Task<Result<AuthResponse>> RefreshTokenAsync(string token, string ipAddress);
        Task<Result> LogoutAsync(string refreshToken, string ipAddress);
    }
}