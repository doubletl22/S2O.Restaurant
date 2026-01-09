using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;

namespace S2O.Identity.Infra.Persistence;

public static class IdentityDataSeeder
{
    public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        // 1. Seed Roles (Theo yêu cầu đề tài: Admin, Owner, Staff, Customer)
        string[] roles = { "SystemAdmin", "RestaurantOwner", "Staff", "Customer" };

        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole { Name = roleName });
            }
        }

        // 2. Seed tài khoản System Admin mẫu
        var adminEmail = "admin@s2o.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "S2O System Administrator",
                TenantId = null, // Tài khoản admin tổng không thuộc tenant nào
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "SystemAdmin");
            }
        }
    }
}