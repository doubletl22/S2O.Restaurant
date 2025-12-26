// Path: src/Services/Identity/S2O.Services.Identity.Infrastructure/DependencyInjection.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Infrastructure.Data;
using S2O.Services.Identity.Infrastructure.Repositories;
using S2O.Services.Identity.Infrastructure.Services;

namespace S2O.Services.Identity.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        // Add other repositories here (RoleRepository, etc.) when you implement them

        // Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        
        return services;
    }
}