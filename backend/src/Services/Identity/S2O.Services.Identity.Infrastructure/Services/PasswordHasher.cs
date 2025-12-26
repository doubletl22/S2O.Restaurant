// Path: src/Services/Identity/S2O.Services.Identity.Infrastructure/Services/PasswordHasher.cs
using S2O.Services.Identity.Application.Interfaces;

namespace S2O.Services.Identity.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool Verify(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}