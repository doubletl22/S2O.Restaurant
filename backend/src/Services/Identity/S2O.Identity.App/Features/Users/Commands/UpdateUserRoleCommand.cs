using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Commands;

public record UpdateUserRoleCommand(Guid UserId, string NewRole) : IRequest<Result<bool>>;

public class UpdateUserRoleHandler : IRequestHandler<UpdateUserRoleCommand, Result<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public UpdateUserRoleHandler(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<bool>> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return Result<bool>.Failure(new Error("User.NotFound", "Không tìm thấy nhân viên"));

        // Kiểm tra Role mới có tồn tại không
        if (!await _roleManager.RoleExistsAsync(request.NewRole))
            return Result<bool>.Failure(new Error("Role.NotFound", "Vai trò không hợp lệ"));

        // Lấy các role hiện tại
        var currentRoles = await _userManager.GetRolesAsync(user);

        // Xóa role cũ
        var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
            return Result<bool>.Failure(new Error("User.UpdateFailed", "Lỗi khi xóa vai trò cũ"));

        // Thêm role mới
        var addResult = await _userManager.AddToRoleAsync(user, request.NewRole);
        if (!addResult.Succeeded)
            return Result<bool>.Failure(new Error("User.UpdateFailed", "Lỗi khi thêm vai trò mới"));

        return Result<bool>.Success(true);
    }
}