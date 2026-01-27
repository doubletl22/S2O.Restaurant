using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore; // Thêm dòng này để dùng FirstOrDefaultAsync
using S2O.Identity.Domain.Entities;
using S2O.Identity.App.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Commands;

public record UpdateStaffCommand(Guid UserId, string FullName, string PhoneNumber, Guid BranchId) : IRequest<Result<bool>>;

public class UpdateStaffHandler : IRequestHandler<UpdateStaffCommand, Result<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthDbContext _context;

    public UpdateStaffHandler(UserManager<ApplicationUser> userManager, IAuthDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateStaffCommand request, CancellationToken ct)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return Result<bool>.Failure(new Error("User.NotFound", "Không tìm thấy nhân viên"));

        // Cập nhật thông tin cơ bản
        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;

        // Cập nhật Chi nhánh (Logic hơi phức tạp vì nằm bảng UserBranches)
        // 1. Tìm UserBranch cũ
        var userBranch = await _context.UserBranches
            .FirstOrDefaultAsync(ub => ub.UserId == request.UserId, ct);

        if (userBranch != null)
        {
            // Nếu đổi chi nhánh
            if (userBranch.BranchId != request.BranchId)
            {
                _context.UserBranches.Remove(userBranch);
                _context.UserBranches.Add(new UserBranch { UserId = request.UserId, BranchId = request.BranchId });
            }
        }
        else
        {
            // Nếu chưa có thì thêm mới
            _context.UserBranches.Add(new UserBranch { UserId = request.UserId, BranchId = request.BranchId });
        }

        // Lưu User
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded) return Result<bool>.Failure(new Error("UpdateFailed", "Lỗi cập nhật user"));

        // Lưu UserBranch
        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}