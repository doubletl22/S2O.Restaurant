using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Cần thêm cái này
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens; // Cần thêm cái này
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using System.Text; // Cần thêm cái này

namespace S2O.Shared.Infra;

public static class DependencyInjection
{
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Cấu hình Cloudinary (Giữ nguyên code của bạn)
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

        // 2. CẤU HÌNH AUTHENTICATION (JWT) - PHẦN QUAN TRỌNG MỚI THÊM
        // Đây là "bộ não" giúp các Service hiểu Token là gì
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            // Lấy Key từ cấu hình (appsettings.json)
            // Nếu không có key thì dùng key mặc định (chỉ để dev, production cấm dùng)
            var secretKey = configuration["Jwt:Secret"] ?? "S2O_Secret_Key_Must_Be_Long_Enough_123456";

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"] ?? "S2O.Identity",
                ValidAudience = configuration["Jwt:Audience"] ?? "S2O.Restaurant",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew = TimeSpan.Zero // Chặn độ trễ, hết hạn là hết ngay
            };
        });

        services.AddAuthorization(); // Bật tính năng phân quyền

        // 3. Đăng ký các Service dùng chung khác
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<IUserContext, UserContext>();
        services.AddScoped<UpdateAuditableEntitiesInterceptor>();
        services.AddScoped<TenantInterceptor>();

        return services;
    }
}