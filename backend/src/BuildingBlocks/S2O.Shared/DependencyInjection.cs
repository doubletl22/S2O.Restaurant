using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Interfaces;
using S2O.Shared.Implementations;

namespace S2O.Shared;

public static class DependencyInjection
{
    public static IServiceCollection AddS2OShared(this IServiceCollection services)
    {
        // Chỉ đăng ký những gì thuộc về Shared (Tenant)
        services.AddScoped<ITenantContext, TenantContext>();
        return services;
    }
}