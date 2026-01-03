using Microsoft.AspNetCore.Authorization;
using S2O.GateWay.Authorization;
using Yarp.ReverseProxy.Forwarder;

namespace S2O.GateWay.Extensions
{
    public static class AuthorizationExtensions
    {
        public static IServiceCollection AddRoleAuthorization(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy =>
                policy.Requirements.Add(new RoleRequirement("Admin")));

                options.AddPolicy("ManageOnly", policy =>
                policy.Requirements.Add(new RoleRequirement("Admin", "Manager")));

                options.AddPolicy("StaffOnly", policy =>
                policy.Requirements.Add(new RoleRequirement("Admin", "Manager", "Staff")));
            });

            services.AddSingleton<IAuthorizationHandler, RoleAuthorizationHandler>();
            return services;
        }
    }
}
