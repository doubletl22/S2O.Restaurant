using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Infra.Interceptors;

namespace S2O.Shared.Infra;

public static class InfraDependencyInjection
{
    public static IServiceCollection AddSharedInfra<TContext>(
        this IServiceCollection services,
        IConfiguration configuration)
        where TContext : BaseDbContext
    {
        // 1. Đăng ký Interceptor
        services.AddScoped<AuditableEntityInterceptor>();

        // 2. Đăng ký DbContext (PostgreSQL)
        var connectionString = configuration.GetConnectionString("Database");

        services.AddDbContext<TContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            // Lấy Interceptor từ DI Container chèn vào
            options.AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>());
        });

        return services;
    }
}