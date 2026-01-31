using S2O.Identity.Domain.Entities;
using System.Security.Claims;

namespace S2O.Identity.App.Abstractions;

public interface ITokenProvider
{
    string Create(ApplicationUser user, IList<string> roles, IEnumerable<Claim>? customClaims = null);
}