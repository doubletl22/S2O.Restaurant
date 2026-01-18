using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterStaffHandler : IRequestHandler<RegisterStaffCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public RegisterStaffHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<Guid>> Handle(RegisterStaffCommand request, CancellationToken cancellationToken)
    {
        // 1. Tạo User
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            BranchId = request.BranchId, // Gán cứng chi nhánh
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
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