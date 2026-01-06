using Microsoft.Extensions.DependencyInjection;
using S2O.Services.Identity.Application.DTOs.Users;
using S2O.Services.Identity.Application.UseCase;
using S2O.Services.Identity.Application.UseCase.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(
            this IServiceCollection services)
        {
            services.AddScoped<AuthenticateUserHandler>();
            services.AddScoped<RefreshAccessTokenHandler>();
            services.AddScoped<LogoutHandler>();
            services.AddScoped<GetUserByTenantHandler>();
            services.AddScoped<RegisterUserHandler>();
            services.AddScoped<PasswordLoginHandler>();
            services.AddScoped<CreateUserHandler>();
            services.AddScoped<DeleteUserHandler>();
            return services;
        }
    }
}
