using S2O.Auth.Domain.Entities;
namespace S2O.Auth.App.Abstractions;
public interface ITokenProvider
{
    string Create(ApplicationUser user, IList<string> roles);
}