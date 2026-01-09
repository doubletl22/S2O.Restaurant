using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Implementations;
using S2O.Shared.Interfaces;
using S2O.Shared.Middlewares;

namespace S2O.Shared.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddS2OShared(this IServiceCollection services)
    {
        // Đăng ký TenantContext là Scoped để nó tồn tại trong suốt 1 request
        services.AddScoped<ITenantContext, TenantContext>();
        return services;
    }

    public static IApplicationBuilder UseTenantResolver(this IApplicationBuilder app)
    {
        app.UseMiddleware<TenantResolverMiddleware>();
        return app;
    }
}