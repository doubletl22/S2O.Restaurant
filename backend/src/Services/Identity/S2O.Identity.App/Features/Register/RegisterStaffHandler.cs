using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterStaffHandler : IRequestHandler<RegisterStaffCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserContext _userContext;
    private readonly ITenantContext _tenantContext;

    public RegisterStaffHandler(UserManager<ApplicationUser> userManager, 
        IUserContext userContext,
        ITenantContext tenantContext)
    {
        _userManager = userManager;
        _userContext = userContext;
        _tenantContext = tenantContext;
    }



    public async Task<Result<Guid>> Handle(RegisterStaffCommand request, CancellationToken cancellationToken)
    {
        var currentTenantId = _tenantContext.TenantId;
        if (currentTenantId == null)
        {
            return Result<Guid>.Failure(Error.Validation("Auth.Invalid", "Chỉ Owner đã đăng nhập mới được tạo Staff."));
        }

        var user = new ApplicationUser
        {
            UserName = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            TenantId = currentTenantId.Value, // <--- QUAN TRỌNG: Lấy theo Owner
            BranchId = request.BranchId,      // Staff thuộc chi nhánh nào do Owner chọn
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return Result<Guid>.Failure(new Error("Identity.RegisterFailed", result.Errors.First().Description));
        }

        // 2. Gán Role "Staff"
        await _userManager.AddToRoleAsync(user, "Staff");

        // 3. Thêm Claim BranchId (Để sau này Token có thông tin chi nhánh)
        await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("branch_id", request.BranchId.ToString()));

        return Result<Guid>.Success(Guid.Parse(user.Id));
    }
}