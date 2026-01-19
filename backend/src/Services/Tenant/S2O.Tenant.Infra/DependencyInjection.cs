using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Infra.Interceptors;
using S2O.Tenant.App.Abstractions;
using S2O.Tenant.Infra.Persistence;

namespace S2O.Tenant.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddTenantInfra(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<TenantInterceptor>(); // Quan trọng để lọc dữ liệu

        services.AddDbContext<TenantDbContext>((sp, options) =>
        {
            var interceptor = sp.GetRequiredService<TenantInterceptor>();
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .AddInterceptors(interceptor);
        });

        // Đăng ký Interface cho App layer dùng
        services.AddScoped<ITenantDbContext>(provider => provider.GetRequiredService<TenantDbContext>());

        return services;
    }
}