using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Commands;

public record AdminResetPasswordCommand(Guid UserId, string NewPassword) : IRequest<Result<bool>>;

public class AdminResetPasswordHandler : IRequestHandler<AdminResetPasswordCommand, Result<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminResetPasswordHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<bool>> Handle(AdminResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return Result<bool>.Failure(new Error("User.NotFound", "Không tìm thấy tài khoản"));

        // Cách nhanh nhất để Admin reset: Xóa pass cũ -> Thêm pass mới
        var removeResult = await _userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded)
            return Result<bool>.Failure(new Error("User.ResetFailed", "Lỗi khi xóa mật khẩu cũ"));

        var addResult = await _userManager.AddPasswordAsync(user, request.NewPassword);
        if (!addResult.Succeeded)
            return Result<bool>.Failure(new Error("User.ResetFailed", string.Join(", ", addResult.Errors.Select(e => e.Description))));

        return Result<bool>.Success(true);
    }
}