using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Infrastructure.Persistence;
using S2O.Services.Identity.Infrastructure.Auth;
using S2O.Services.Identity.Infrastructure.Firebase;

namespace S2O.Services.Identity.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration config)
        {
            services.AddDbContext<AppIdentityDbContext>(opt =>
                opt.UseNpgsql(config.GetConnectionString("AuthDb")));

            services.Configure<JwtSettings>(
          config.GetSection("Jwt"));

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IFirebaseService, FirebaseService>();
            services.AddScoped<IJwtService, JwtService>();

            return services;
        }
    }
}
