using Microsoft.AspNetCore.Identity.Data;
using S2O.Services.Identity.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IAuthService
    { 
        Task<AuthResponse> LoginAsync(DTOs.LoginRequest request, string ipAddress);
        Task<AuthResponse> RegisterAsync(DTOs.RegisterRequest request, string ipAddress);
        Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress);
        Task LogoutAsync(string refreshToken);
    }
}
