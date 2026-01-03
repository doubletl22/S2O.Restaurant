using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Infra.Interceptors;

namespace S2O.Shared.Infra;

public static class InfraDependencyInjection
{
    public static IServiceCollection AddSharedInfra<TContext>(
        this IServiceCollection services,
        IConfiguration configuration)
        where TContext : DbContext // Đảm bảo constraint là DbContext
    {
        // 1. SỬA DÒNG NÀY: Đăng ký Interface map với Class cụ thể
        services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
                            ?? configuration.GetConnectionString("AuthDb")
                            ?? configuration.GetConnectionString("Database");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Connection string not found.");
        }

        services.AddDbContext<TContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);

            // 2. SỬA DÒNG NÀY: Lấy ra theo Interface thay vì Class cụ thể
            options.AddInterceptors(sp.GetRequiredService<ISaveChangesInterceptor>());
        });

        return services;
    }
}