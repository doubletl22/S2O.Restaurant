using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Commands;

public class DeleteStaffHandler : IRequestHandler<DeleteStaffCommand, Result<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public DeleteStaffHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<bool>> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
        {
            return Result<bool>.Failure(new Error("Staff.NotFound", "Nhân viên không tồn tại"));
        }

        if (user.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(new Error("Staff.Unauthorized", "Bạn không có quyền xóa nhân viên này"));
        }

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result<bool>.Failure(new Error("Staff.DeleteFailed", errors));
        }

        return Result<bool>.Success(true);
    }
}