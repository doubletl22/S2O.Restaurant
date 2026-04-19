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
    private static readonly HashSet<string> AllowedStaffRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Staff",
        "RestaurantStaff",
        "Manager",
        "Chef",
        "Waiter"
    };

    private const int MinPasswordLength = 6;
    private const int MaxPasswordLength = 50;

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    public UpdateStaffHandler(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<bool>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var validationResult = ValidateRequest(request);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
            return Result<bool>.Failure(new Error("Staff.NotFound", "Không tìm thấy nhân viên"));

        // [Security Check] Đảm bảo nhân viên này thuộc Tenant của Owner đang gọi
        if (user.TenantId != request.TenantId)
            return Result<bool>.Failure(new Error("Staff.Unauthorized", "Bạn không có quyền sửa nhân viên này"));

        var normalizedFullName = request.FullName.Trim();
        var normalizedRole = request.Role.Trim();

        // 1. Cập nhật thông tin cơ bản
        user.FullName = normalizedFullName;
        user.BranchId = request.BranchId;
        user.IsActive = request.IsActive;

        // 2. Đổi mật khẩu (Nếu có)
        if (!string.IsNullOrEmpty(request.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
            if (!passResult.Succeeded)
            {
                var passwordError = string.Join(", ", passResult.Errors.Select(e => e.Description));
                return Result<bool>.Failure(new Error("Staff.PasswordError", string.IsNullOrWhiteSpace(passwordError) ? "Lỗi đổi mật khẩu" : passwordError));
            }
        }

        // 3. Cập nhật Role
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (!currentRoles.Contains(normalizedRole, StringComparer.OrdinalIgnoreCase))
        {
            if (!await _roleManager.RoleExistsAsync(normalizedRole))
            {
                return Result<bool>.Failure(new Error("Role.Invalid", "Vai trò không hợp lệ cho nhân viên."));
            }

            // Xóa role cũ và thêm role mới
            var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeRolesResult.Succeeded)
            {
                var removeRoleError = string.Join(", ", removeRolesResult.Errors.Select(e => e.Description));
                return Result<bool>.Failure(new Error("Staff.RoleUpdateFailed", string.IsNullOrWhiteSpace(removeRoleError) ? "Không thể xóa vai trò cũ." : removeRoleError));
            }

            var addRoleResult = await _userManager.AddToRoleAsync(user, normalizedRole);
            if (!addRoleResult.Succeeded)
            {
                var addRoleError = string.Join(", ", addRoleResult.Errors.Select(e => e.Description));
                return Result<bool>.Failure(new Error("Staff.RoleUpdateFailed", string.IsNullOrWhiteSpace(addRoleError) ? "Không thể thêm vai trò mới." : addRoleError));
            }

            // Cập nhật lại Claim Role trong DB luôn để lần sau login đúng
            var claims = await _userManager.GetClaimsAsync(user);
            var roleClaim = claims.FirstOrDefault(c => c.Type == "role");
            if (roleClaim != null)
            {
                var removeRoleClaimResult = await _userManager.RemoveClaimAsync(user, roleClaim);
                if (!removeRoleClaimResult.Succeeded)
                {
                    return Result<bool>.Failure(new Error("Staff.RoleUpdateFailed", "Không thể cập nhật claim vai trò."));
                }
            }

            var addRoleClaimResult = await _userManager.AddClaimAsync(user, new Claim("role", normalizedRole));
            if (!addRoleClaimResult.Succeeded)
            {
                return Result<bool>.Failure(new Error("Staff.RoleUpdateFailed", "Không thể cập nhật claim vai trò."));
            }
        }

        // Cập nhật Claim BranchId mới nếu đổi chi nhánh
        var branchClaim = (await _userManager.GetClaimsAsync(user)).FirstOrDefault(c => c.Type == "branch_id");
        if (branchClaim != null)
        {
            var removeBranchClaimResult = await _userManager.RemoveClaimAsync(user, branchClaim);
            if (!removeBranchClaimResult.Succeeded)
            {
                return Result<bool>.Failure(new Error("Staff.UpdateFailed", "Không thể cập nhật claim chi nhánh."));
            }
        }

        var addBranchClaimResult = await _userManager.AddClaimAsync(user, new Claim("branch_id", request.BranchId.ToString()));
        if (!addBranchClaimResult.Succeeded)
        {
            return Result<bool>.Failure(new Error("Staff.UpdateFailed", "Không thể cập nhật claim chi nhánh."));
        }


        // 4. Lưu User
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var updateError = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            return Result<bool>.Failure(new Error("Staff.UpdateFailed", string.IsNullOrWhiteSpace(updateError) ? "Không thể cập nhật nhân viên." : updateError));
        }

        return Result<bool>.Success(true);
    }

    private static Result<bool>? ValidateRequest(UpdateStaffCommand request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return Result<bool>.Failure(new Error("Staff.InvalidFullName", "Họ tên không hợp lệ."));
        }

        if (request.BranchId == Guid.Empty)
        {
            return Result<bool>.Failure(new Error("Branch.Invalid", "Chi nhánh không hợp lệ."));
        }

        if (string.IsNullOrWhiteSpace(request.Role) || !AllowedStaffRoles.Contains(request.Role.Trim()))
        {
            return Result<bool>.Failure(new Error("Role.Invalid", "Vai trò không hợp lệ cho nhân viên."));
        }

        if (!string.IsNullOrEmpty(request.Password))
        {
            var password = request.Password.Trim();
            if (password.Length < MinPasswordLength || password.Length > MaxPasswordLength)
            {
                return Result<bool>.Failure(new Error("Staff.PasswordError", $"Mật khẩu phải có độ dài từ {MinPasswordLength} đến {MaxPasswordLength} ký tự."));
            }
        }

        return null;
    }
}