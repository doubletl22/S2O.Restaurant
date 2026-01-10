// Path: BuildingBlocks/S2O.Shared.Infra/DependencyInjection.cs
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Shared.Infra; // Đảm bảo có namespace này

public static class DependencyInjection
{
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();

        // Đăng ký các dịch vụ dùng chung
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<IUserContext, UserContext>();
        services.AddScoped<IFileStorageService, S3StorageService>();

        // Đăng ký Interceptors cho EF Core
        services.AddScoped<UpdateAuditableEntitiesInterceptor>();
        services.AddScoped<TenantInterceptor>();

        return services;
    }
}