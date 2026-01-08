using Microsoft.AspNetCore.Identity;

namespace S2O.Auth.Domain.Entities;

public class ApplicationRole : IdentityRole
{
    public string Description { get; set; } = string.Empty;
}