using CloudinaryDotNet;
using Microsoft.Extensions.Configuration; // Thêm cái này
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Shared.Infra;

public static class DependencyInjection
{
    // Chỉ đăng ký những thứ mọi Microservice đều cần
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];

        if (!string.IsNullOrEmpty(cloudName))
        {
            var account = new Account(
                cloudName,
                configuration["Cloudinary:ApiKey"],
                configuration["Cloudinary:ApiSecret"]
            );
            var cloudinary = new Cloudinary(account);
            services.AddSingleton(cloudinary);
            services.AddScoped<IFileStorageService, CloudinaryStorageService>();
        }
        services.AddHttpContextAccessor();
        services.AddAuthentication();
        services.AddAuthorization();
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<IUserContext, UserContext>();
        services.AddScoped<UpdateAuditableEntitiesInterceptor>();
        services.AddScoped<TenantInterceptor>();

        return services;
    }

}