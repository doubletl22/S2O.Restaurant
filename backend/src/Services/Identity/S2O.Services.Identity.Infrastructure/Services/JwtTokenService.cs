using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Infrastructure.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;

        public JwtTokenService(IConfiguration config)
        {
            _config = config;

            var secret = _config["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key is missing");
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        }

        public string GenerateRefreshToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes)
                .Replace("+", "_")
                .Replace("=", "")
                .Replace("/", "_");
        }

        public string GenerateAccessToken(Guid userId, Guid tenantId, string role)
        {
            var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub,userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("tid", tenantId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Iss, _config["Jwt:Issuer"]!),
            new Claim(JwtRegisteredClaimNames.Aud, _config["Jwt:Audience"]!),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64) };
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(GetAccessTokenLifetimeMinutes());
            var token = new JwtSecurityToken(issuer: _config["Jwt:Issuer"],audience: _config["Jwt:Audience"], claims: claims, expires: expires, signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        public AuthResponseDto GenerateAuthResponse(Guid userId, Guid tenantId, string role)
        {
            var accessToken = GenerateAccessToken(userId, tenantId, role);
            var refreshToken = GenerateRefreshToken();
            var refreshExpires = DateTime.UtcNow.AddDays(GetRefreshTokenLifetimeDays());

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(GetAccessTokenLifetimeMinutes()),
                RefreshToken = refreshToken,
                RefreshExpiresAt = refreshExpires
            };
        }

        public int GetAccessTokenLifetimeMinutes()
        {
            return int.TryParse(_config["Jwt:AccessTokenLifetimeMinutes"], out var m) ? m : 120;
        }

        public int GetRefreshTokenLifetimeDays()
        {
            return int.TryParse(_config["Jwt:RefreshTokenLifetimeDays"], out var d) ? d : 7;
        }
    }
}
