using Microsoft.AspNetCore.Identity;
using S2O.Identity.App.Features.Register;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterOwnerCommandHandler : ICommandHandler<RegisterOwnerCommand, Guid>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public RegisterOwnerCommandHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<Guid>> Handle(RegisterOwnerCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Email đã tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure(new Error("Auth.DuplicateEmail", "Email này đã được đăng ký."));
        }

        // 2. Tạo TenantId duy nhất cho nhà hàng mới 
        // Trong thực tế, bạn có thể gọi sang Service Tenant hoặc tự sinh một mã GUID
        var newTenantId = Guid.NewGuid();

        // 3. Khởi tạo đối tượng User
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            TenantId = newTenantId, 
            CreatedAtUtc = DateTime.UtcNow
        };

        // 4. Lưu User vào Database (UserManager tự động băm mật khẩu) 
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.First();
            return Result<Guid>.Failure(new Error(firstError.Code, firstError.Description));
        }

        // 5. Gán quyền 'RestaurantOwner' cho User [cite: 7, 28]
        // Đảm bảo Role này đã tồn tại trong hệ thống
        if (!await _roleManager.RoleExistsAsync("RestaurantOwner"))
        {
            await _roleManager.CreateAsync(new ApplicationRole { Name = "RestaurantOwner" });
        }
        await _userManager.AddToRoleAsync(user, "RestaurantOwner");

        // 6. Trả về ID của User vừa tạo
        return Result<Guid>.Success(Guid.Parse(user.Id));
    }
}