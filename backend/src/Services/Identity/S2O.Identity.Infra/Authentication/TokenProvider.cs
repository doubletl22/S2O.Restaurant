using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Constants;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace S2O.Identity.Infra.Authentication;

public class TokenProvider : ITokenProvider
{
    private readonly IConfiguration _configuration;

    public TokenProvider(IConfiguration configuration) => _configuration = configuration;

    // Thêm tham số customClaims
    public string Create(ApplicationUser user, IList<string> roles, IEnumerable<Claim>? customClaims = null)
    {
        var claims = new List<Claim>
        {
             new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
             new Claim(JwtRegisteredClaimNames.Email, user.Email!),
             new Claim(ClaimConstants.TenantId, user.TenantId?.ToString() ?? string.Empty)
        };

        // 1. Thêm Roles với tên ngắn gọn là "role"
        foreach (var role in roles)
        {
            // QUAN TRỌNG: Dùng chuỗi "role" thay vì ClaimTypes.Role
            claims.Add(new Claim("role", role));
        }

        // 2. Thêm Custom Claims (như branch_id)
        if (customClaims != null)
        {
            foreach (var claim in customClaims)
            {
                // Tránh add trùng TenantId nếu đã có
                if (claim.Type != ClaimConstants.TenantId)
                {
                    claims.Add(claim);
                }
            }
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"] ?? "S2O_Super_Secret_Key_For_Identity_Service_2026"));
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