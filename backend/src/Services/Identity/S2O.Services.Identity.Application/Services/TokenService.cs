using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System.Security.Cryptography;

namespace S2O.Services.Identity.Application.Services
{
    public class TokenService : ITokenService
    {
        public TokenService()
        {
        }

        public string CreateAccessToken(User user)
        {
            return $"access-token-{Guid.NewGuid()}";
        }

        public RefreshToken CreateRefreshToken(string ipAddress)
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = ipAddress,

                UserId = Guid.Empty 
            };
        }
    }
}