using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using S2O.Booking.App.Abstractions;
using S2O.Booking.Infra.Persistence;
using S2O.Shared.Infra.Interceptors;

namespace S2O.Booking.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddBookingInfra(this IServiceCollection services, IConfiguration configuration)
    {
        // SỬA: Dùng đúng tên class 'UpdateAuditableEntitiesInterceptor'
        services.AddScoped<UpdateAuditableEntitiesInterceptor>();
        services.AddScoped<TenantInterceptor>();

        services.AddDbContext<BookingDbContext>((sp, options) =>
        {
            // SỬA: Lấy đúng service ra
            var auditInterceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
            var tenantInterceptor = sp.GetRequiredService<TenantInterceptor>();

            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .AddInterceptors(auditInterceptor, tenantInterceptor);
        });

        services.AddScoped<IBookingDbContext>(provider => provider.GetRequiredService<BookingDbContext>());

        return services;
    }
}