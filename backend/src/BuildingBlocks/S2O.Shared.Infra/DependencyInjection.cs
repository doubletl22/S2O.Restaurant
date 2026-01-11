using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration; // Thêm cái này
using Amazon.S3; // Cần cài package AWSSDK.Extensions.NETCore.Setup vào project Infra
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Shared.Infra;

public static class DependencyInjection
{
    // Chỉ đăng ký những thứ mọi Microservice đều cần
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddAuthentication();
        services.AddAuthorization();
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<IUserContext, UserContext>();

        // Interceptors cho EF Core
        services.AddScoped<UpdateAuditableEntitiesInterceptor>();
        services.AddScoped<TenantInterceptor>();

        return services;
    }

    // Đăng ký riêng cho những Service cần dùng S3 Storage (như Catalog)
    public static IServiceCollection AddS2OStorage(this IServiceCollection services, IConfiguration configuration)
    {
        // Đăng ký AWS SDK
        var awsOptions = configuration.GetAWSOptions();
        services.AddDefaultAWSOptions(awsOptions);
        services.AddAWSService<IAmazonS3>();

        // Đăng ký Implementation
        services.AddScoped<IFileStorageService, S3StorageService>();

        return services;
    }
}