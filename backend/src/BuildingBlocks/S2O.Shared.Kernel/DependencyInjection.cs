using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using S2O.Shared.Kernel.Behaviors;

namespace S2O.Shared.Kernel;

public static class KernelDependencyInjection
{
    public static IServiceCollection AddSharedKernel(this IServiceCollection services, Assembly assembly)
    {
        // 1. Đăng ký MediatR
        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);

            // 2. Đăng ký Behaviors (Thứ tự quan trọng: Log trước -> Validate sau)
            config.AddOpenBehavior(typeof(LoggingBehavior<,>));
            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        // 3. Đăng ký Validators (FluentValidation)
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}