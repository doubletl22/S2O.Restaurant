using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using System.Security.Claims;

namespace S2O.Identity.App.Features.Users.Commands;

public record UpdateStaffCommand(
    Guid UserId,
    string FullName,
    Guid BranchId,
    string Role,     // Role mới
    bool IsActive,
    string? Password, // Nếu có gửi thì đổi pass, không thì thôi
    Guid TenantId    // Được Controller inject vào
) : IRequest<Result<bool>>;

public class UpdateStaffHandler : IRequestHandler<UpdateStaffCommand, Result<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    public UpdateStaffHandler(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<bool>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
            return Result<bool>.Failure(new Error("Staff.NotFound", "Không tìm thấy nhân viên"));

        // [Security Check] Đảm bảo nhân viên này thuộc Tenant của Owner đang gọi
        if (user.TenantId != request.TenantId)
            return Result<bool>.Failure(new Error("Staff.Unauthorized", "Bạn không có quyền sửa nhân viên này"));

        // 1. Cập nhật thông tin cơ bản
        user.FullName = request.FullName;
        user.BranchId = request.BranchId;
        user.IsActive = request.IsActive;

        // 2. Đổi mật khẩu (Nếu có)
        if (!string.IsNullOrEmpty(request.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
            if (!passResult.Succeeded)
                return Result<bool>.Failure(new Error("Staff.PasswordError", "Lỗi đổi mật khẩu"));
        }

        // 3. Cập nhật Role
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (!currentRoles.Contains(request.Role))
        {
            // Xóa role cũ và thêm role mới
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, request.Role);

            // Cập nhật lại Claim Role trong DB luôn để lần sau login đúng
            var claims = await _userManager.GetClaimsAsync(user);
            var roleClaim = claims.FirstOrDefault(c => c.Type == "role");
            if (roleClaim != null) await _userManager.RemoveClaimAsync(user, roleClaim);
            await _userManager.AddClaimAsync(user, new Claim("role", request.Role));
        }

        // Cập nhật Claim BranchId mới nếu đổi chi nhánh
        var branchClaim = (await _userManager.GetClaimsAsync(user)).FirstOrDefault(c => c.Type == "branch_id");
        if (branchClaim != null) await _userManager.RemoveClaimAsync(user, branchClaim);
        await _userManager.AddClaimAsync(user, new Claim("branch_id", request.BranchId.ToString()));


        // 4. Lưu User
        await _userManager.UpdateAsync(user);

        return Result<bool>.Success(true);
    }
}