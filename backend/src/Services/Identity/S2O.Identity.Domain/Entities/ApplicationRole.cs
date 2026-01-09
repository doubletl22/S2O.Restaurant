namespace S2O.Identity.Domain.Entities;

using Microsoft.AspNetCore.Identity;

public class ApplicationRole : IdentityRole
{
    public string Description { get; set; } = string.Empty;
}