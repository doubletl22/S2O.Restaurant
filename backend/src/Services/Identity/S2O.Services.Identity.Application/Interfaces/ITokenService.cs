using S2O.Services.Identity.Domain.Entities;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface ITokenService
    {
        // Tạo JWT Access Token
        string CreateAccessToken(User user);

        // Tạo Refresh Token (Nhận IP Address của người dùng)
        RefreshToken CreateRefreshToken(string ipAddress);
    }
}