using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;
using S2O.Identity.App.Abstractions;
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
    private readonly IAuthDbContext _context;

    public UpdateStaffHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IAuthDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
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

        var branchValidationResult = await ValidateBranchAsync(request.BranchId, request.TenantId, cancellationToken);
        if (branchValidationResult is not null)
        {
            return branchValidationResult;
        }

        var normalizedFullName = request.FullName.Trim();
        var normalizedRole = request.Role.Trim();

        // 1. Cập nhật thông tin cơ bản
        user.FullName = normalizedFullName;
        user.BranchId = request.BranchId;
        user.IsActive = request.IsActive;

        // 2. Đổi mật khẩu (Nếu có)
        var normalizedPassword = request.Password?.Trim();
        if (!string.IsNullOrEmpty(normalizedPassword))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await _userManager.ResetPasswordAsync(user, token, normalizedPassword);
            if (!passResult.Succeeded)
            {
                var passwordError = string.Join(", ", passResult.Errors.Select(e => e.Description));
                return Result<bool>.Failure(new Error("Staff.PasswordError", string.IsNullOrWhiteSpace(passwordError) ? "Lỗi đổi mật khẩu" : passwordError));
            }
        }

        // 3. Cập nhật Role
        var currentRoles = await _userManager.GetRolesAsync(user);
        var hasTargetRole = currentRoles.Contains(normalizedRole, StringComparer.OrdinalIgnoreCase);

        if (!await _roleManager.RoleExistsAsync(normalizedRole))
        {
            return Result<bool>.Failure(new Error("Role.Invalid", "Vai trò không hợp lệ cho nhân viên."));
        }

        if (!hasTargetRole)
        {
            // Thêm role mới trước để tránh trạng thái user không có role nếu có lỗi giữa chừng.
            var addRoleResult = await _userManager.AddToRoleAsync(user, normalizedRole);
            if (!addRoleResult.Succeeded)
            {
                var addRoleError = string.Join(", ", addRoleResult.Errors.Select(e => e.Description));
                return Result<bool>.Failure(new Error("Staff.RoleUpdateFailed", string.IsNullOrWhiteSpace(addRoleError) ? "Không thể thêm vai trò mới." : addRoleError));
            }

            var rolesToRemove = currentRoles
                .Where(r => !string.Equals(r, normalizedRole, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (rolesToRemove.Count > 0)
            {
                var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                if (!removeRolesResult.Succeeded)
                {
                    // Best effort rollback để tránh dư quyền khi xóa role cũ thất bại.
                    await _userManager.RemoveFromRoleAsync(user, normalizedRole);

                    var removeRoleError = string.Join(", ", removeRolesResult.Errors.Select(e => e.Description));
                    return Result<bool>.Failure(new Error("Staff.RoleUpdateFailed", string.IsNullOrWhiteSpace(removeRoleError) ? "Không thể xóa vai trò cũ." : removeRoleError));
                }
            }
        }

        // Đồng bộ claim role kể cả khi role không thay đổi, để dữ liệu claim luôn nhất quán.
        var claims = await _userManager.GetClaimsAsync(user);
        var roleClaims = claims.Where(c => c.Type == "role").ToList();
        foreach (var claim in roleClaims)
        {
            var removeRoleClaimResult = await _userManager.RemoveClaimAsync(user, claim);
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

        // Đồng bộ claim branch_id về đúng 1 giá trị để tránh claim trùng sau nhiều lần cập nhật.
        var latestClaims = await _userManager.GetClaimsAsync(user);
        var branchClaims = latestClaims.Where(c => c.Type == "branch_id").ToList();
        foreach (var claim in branchClaims)
        {
            var removeBranchClaimResult = await _userManager.RemoveClaimAsync(user, claim);
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

        var branchSyncResult = await SyncUserBranchAsync(user.Id, request.BranchId, request.TenantId, cancellationToken);
        if (branchSyncResult is not null)
        {
            return branchSyncResult;
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

    private async Task<Result<bool>?> ValidateBranchAsync(Guid branchId, Guid tenantId, CancellationToken cancellationToken)
    {
        if (branchId == Guid.Empty)
        {
            return Result<bool>.Failure(new Error("Branch.Invalid", "Chi nhánh không hợp lệ."));
        }

        var branchExists = await _context.Branches
            .AsNoTracking()
            .AnyAsync(branch => branch.Id == branchId && branch.TenantId == tenantId, cancellationToken);

        if (!branchExists)
        {
            return Result<bool>.Failure(new Error("Branch.NotFound", "Chi nhánh không tồn tại hoặc không thuộc tenant hiện tại."));
        }

        return null;
    }

    private async Task<Result<bool>?> SyncUserBranchAsync(Guid userId, Guid branchId, Guid tenantId, CancellationToken cancellationToken)
    {
        var staleMappings = await _context.UserBranches
            .Where(mapping => mapping.UserId == userId)
            .ToListAsync(cancellationToken);

        if (staleMappings.Count > 0)
        {
            _context.UserBranches.RemoveRange(staleMappings);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var newMapping = new UserBranch
        {
            UserId = userId,
            BranchId = branchId,
            IsManager = string.Equals(await ResolvePrimaryRoleAsync(userId, cancellationToken), "Manager", StringComparison.OrdinalIgnoreCase)
        };

        await _context.UserBranches.AddAsync(newMapping, cancellationToken);

        var saveResult = await _context.SaveChangesAsync(cancellationToken);
        if (saveResult <= 0)
        {
            return Result<bool>.Failure(new Error("Staff.UpdateFailed", "Không thể đồng bộ chi nhánh nhân viên."));
        }

        return null;
    }

    private async Task<string> ResolvePrimaryRoleAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return "Staff";
        }

        var roles = await _userManager.GetRolesAsync(user);
        return roles.FirstOrDefault() ?? "Staff";
    }
}