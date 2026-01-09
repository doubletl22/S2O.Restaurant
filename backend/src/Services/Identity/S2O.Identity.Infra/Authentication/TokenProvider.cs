using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace S2O.Identity.Infra.Authentication;

public class TokenProvider : ITokenProvider
{
    private readonly IConfiguration _configuration;

    public TokenProvider(IConfiguration configuration) => _configuration = configuration;

    public string Create(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
             new Claim(JwtRegisteredClaimNames.Sub, user.Id),
             new Claim(JwtRegisteredClaimNames.Email, user.Email!),
             new Claim("tenant_id", user.TenantId?.ToString() ?? string.Empty)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token); 
    }
}