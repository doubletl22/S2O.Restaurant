using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;

namespace S2O.Identity.Infra.Persistence;

public static class IdentityDataSeeder
{
    private const string AdminEmail = "admin@s2o.com";
    private const string AdminDefaultPassword = "Admin@123";

    // ID CỐ ĐỊNH (Để dùng chung cho Catalog Service)
    public static readonly Guid FixedTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid Branch1Id = Guid.Parse("22222222-2222-2222-2222-222222222222"); // Chi nhánh Cầu Giấy
    public static readonly Guid Branch2Id = Guid.Parse("33333333-3333-3333-3333-333333333333"); // Chi nhánh Hoàn Kiếm
    // Thêm tham số AuthDbContext context vào hàm

    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        AuthDbContext context,
        bool resetAdminPassword)
    {
        // 1. Seed Roles
        string[] roles = { "SystemAdmin", "RestaurantOwner", "Staff", "Customer" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole { Name = roleName });
            }
        }
        // 2. Seed System Admin (Giữ nguyên)

        var adminUser = await userManager.FindByEmailAsync(AdminEmail);

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = AdminEmail,
                Email = AdminEmail,
                FullName = "System Admin",
                EmailConfirmed = true
            };

            await userManager.CreateAsync(adminUser, AdminDefaultPassword);
        }

        if (!await userManager.IsInRoleAsync(adminUser, "SystemAdmin"))
        {
            await userManager.AddToRoleAsync(adminUser, "SystemAdmin");
        }

        if (resetAdminPassword)
        {
            var resetToken = await userManager.GeneratePasswordResetTokenAsync(adminUser);
            await userManager.ResetPasswordAsync(adminUser, resetToken, AdminDefaultPassword);
        }

    }

}