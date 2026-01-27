using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterCustomerCommandHandler : IRequestHandler<RegisterCustomerCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public RegisterCustomerCommandHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<Guid>> Handle(RegisterCustomerCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Email đã tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure(new Error("Auth.DuplicateEmail", "Email này đã được sử dụng."));
        }

        // 2. Tạo User (Khách hàng)
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            TenantId = request.TenantId, // Gán vào Tenant (Quán)
            BranchId = null,             // Khách hàng không thuộc về chi nhánh cụ thể nào (hoặc logic tùy bạn)
            CreatedAtUtc = DateTime.UtcNow,
            IsActive = true
        };

        // 3. Lưu xuống DB
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.First();
            return Result<Guid>.Failure(new Error(firstError.Code, firstError.Description));
        }

        // 4. Gán quyền "Customer"
        // (Role này đã được tạo sẵn trong Seeder)
        await _userManager.AddToRoleAsync(user, "Customer");

        return Result<Guid>.Success((user.Id));
    }
}