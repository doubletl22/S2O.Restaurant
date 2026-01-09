using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Infra.Interceptors;

public static class DependencyInjection
{
    public static IServiceCollection AddS2OInfra(this IServiceCollection services)
    {
        services.AddScoped<UpdateAuditableEntitiesInterceptor>();
        services.AddScoped<TenantInterceptor>();
        return services;
    }
}