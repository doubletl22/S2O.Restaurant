using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Application.UseCase;
using S2O.Services.Identity.Domain.Entities;
using S2O.Services.Identity.Infrastructure.Data;
using S2O.Services.Identity.Infrastructure.Repositories;
using S2O.Services.Identity.Infrastructure.Security;
using S2O.Services.Identity.Infrastructure.Services;
using System.Text;

namespace S2O.Services.Identity.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppIdentityDbContext>(opt =>
                opt.UseNpgsql(configuration.GetConnectionString("AuthDb")));

            services.AddCors(options => 
            { options.AddPolicy("AllowAll", 
                policy => 
                { 
                    policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod(); 
                }); 
            }); 


            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserTenantRepository, UserTenantRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<ITenantRepository, TenantRepository>();
            services.AddScoped<IFirebaseAuthService, FirebaseAuthService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
            return services;
        }
    }
}
