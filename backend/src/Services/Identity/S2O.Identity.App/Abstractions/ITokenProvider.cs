namespace S2O.Identity.App.Abstractions; 
using S2O.Identity.Domain.Entities;
public interface ITokenProvider
{
    string Create(ApplicationUser user, IList<string> roles);
}