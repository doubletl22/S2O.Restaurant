using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Payment.App.Abstractions;
using S2O.Payment.Infra.Persistence;
using S2O.Shared.Infra.Interceptors;

namespace S2O.Payment.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddPaymentInfra(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<UpdateAuditableEntitiesInterceptor>(); // Lưu ý tên đúng
        services.AddScoped<TenantInterceptor>();

        services.AddDbContext<PaymentDbContext>((sp, options) =>
        {
            var auditInterceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
            var tenantInterceptor = sp.GetRequiredService<TenantInterceptor>();

            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .AddInterceptors(auditInterceptor, tenantInterceptor);
        });

        services.AddScoped<IPaymentDbContext>(provider => provider.GetRequiredService<PaymentDbContext>());

        return services;
    }
}