using Microsoft.Extensions.DependencyInjection;
using MediatR;
using FluentValidation;
using System.Reflection;
using S2O.Shared.Kernel.Behaviors;

namespace S2O.Shared.Kernel
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddSharedKernel(this IServiceCollection services, Assembly assembly)
        {
            // Đăng ký MediatR
            services.AddMediatR(config =>
            {
                config.RegisterServicesFromAssembly(assembly);

                // Đăng ký Pipeline Behavior (Thứ tự quan trọng: Log trước -> Validate sau)
                config.AddOpenBehavior(typeof(LoggingBehavior<,>));
                config.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });

            // Đăng ký tất cả Validator có trong Assembly gọi tới
            services.AddValidatorsFromAssembly(assembly);

            return services;
        }
    }
}