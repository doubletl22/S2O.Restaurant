// Path: src/Services/Identity/S2O.Services.Identity.Application/DependencyInjection.cs
using Microsoft.Extensions.DependencyInjection;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Application.Services;

namespace S2O.Services.Identity.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITokenService, TokenService>();
        return services;
    }
}