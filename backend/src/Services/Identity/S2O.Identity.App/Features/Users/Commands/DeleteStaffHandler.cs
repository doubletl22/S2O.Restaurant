using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Commands;

public class DeleteStaffHandler : IRequestHandler<DeleteStaffCommand, Result<bool>>
{
    private static readonly HashSet<string> ProtectedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "SystemAdmin",
        "RestaurantOwner"
    };

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthDbContext _context;

    public DeleteStaffHandler(UserManager<ApplicationUser> userManager, IAuthDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
    {
        var validationResult = ValidateRequest(request);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var scopedUserResult = await ResolveScopedUserAsync(request.UserId, request.TenantId);
        if (scopedUserResult.IsFailure)
        {
            return Result<bool>.Failure(scopedUserResult.Error);
        }

        var user = scopedUserResult.Value;

        var targetRoles = await _userManager.GetRolesAsync(user);
        if (HasProtectedRole(targetRoles))
        {
            return Result<bool>.Failure(new Error("Staff.DeleteBlocked", "Không thể xóa tài khoản đặc quyền."));
        }

        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow)
        {
            return Result<bool>.Failure(new Error("Staff.DeleteBlocked", "Không thể xóa tài khoản đang bị khóa."));
        }

        var mappingCleanupResult = await RemoveBranchMappingsAsync(user.Id, cancellationToken);
        if (mappingCleanupResult is not null)
        {
            return mappingCleanupResult;
        }

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result<bool>.Failure(new Error("Staff.DeleteFailed", errors));
        }

        return Result<bool>.Success(true);
    }

    private static Result<bool>? ValidateRequest(DeleteStaffCommand request)
    {
        if (request.UserId == Guid.Empty)
        {
            return Result<bool>.Failure(new Error("Staff.InvalidRequest", "Id nhân viên không hợp lệ."));
        }

        if (request.TenantId == Guid.Empty)
        {
            return Result<bool>.Failure(new Error("Staff.InvalidRequest", "TenantId không hợp lệ."));
        }

        return null;
    }

    private static bool HasProtectedRole(IEnumerable<string> roles)
    {
        foreach (var role in roles)
        {
            if (ProtectedRoles.Contains(role))
            {
                return true;
            }
        }

        return false;
    }

    private async Task<Result<ApplicationUser>> ResolveScopedUserAsync(Guid userId, Guid tenantId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Result<ApplicationUser>.Failure(new Error("Staff.NotFound", "Không tìm thấy nhân viên cần xóa."));
        }

        if (user.TenantId != tenantId)
        {
            return Result<ApplicationUser>.Failure(new Error("Staff.Forbidden", "Bạn không có quyền xóa nhân viên này."));
        }

        return Result<ApplicationUser>.Success(user);
    }

    private async Task<Result<bool>?> RemoveBranchMappingsAsync(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var mappings = await _context.UserBranches
                .Where(mapping => mapping.UserId == userId)
                .ToListAsync(cancellationToken);

            if (mappings.Count == 0)
            {
                return null;
            }

            _context.UserBranches.RemoveRange(mappings);
            var saveChanges = await _context.SaveChangesAsync(cancellationToken);

            if (saveChanges <= 0)
            {
                return Result<bool>.Failure(new Error("Staff.DeleteFailed", "Không thể xóa mapping chi nhánh của nhân viên."));
            }

            return null;
        }
        catch
        {
            return Result<bool>.Failure(new Error("Staff.DeleteFailed", "Lỗi hệ thống khi xóa mapping chi nhánh của nhân viên."));
        }
    }
}