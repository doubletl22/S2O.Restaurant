using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore.Diagnostics; 
using S2O.Shared.Infra.Interceptors;

namespace S2O.Shared.Infra;

public static class InfraDependencyInjection
{
    public static IServiceCollection AddSharedInfra<TContext>(
        this IServiceCollection services,
        IConfiguration configuration)
        where TContext : DbContext
    {
        // Đăng ký Interceptor
        services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        var connectionString = configuration.GetConnectionString("DefaultConnection")
                            ?? configuration.GetConnectionString("Database")
                            ?? configuration.GetConnectionString("AuthDb");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        services.AddDbContext<TContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<ISaveChangesInterceptor>());
        });

        return services;
    }
}