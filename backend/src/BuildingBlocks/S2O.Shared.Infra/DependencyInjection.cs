using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Infra.Interceptors;

namespace S2O.Shared.Infra
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddSharedInfra(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
            return services;
        }
    }
}