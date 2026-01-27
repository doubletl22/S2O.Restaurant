using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Commands;

public record DeleteUserCommand(Guid UserId) : IRequest<Result<bool>>;

public class DeleteUserHandler : IRequestHandler<DeleteUserCommand, Result<bool>>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public DeleteUserHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<bool>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return Result<bool>.Failure(new Error("User.NotFound", "Không tìm thấy tài khoản"));

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return Result<bool>.Failure(new Error("User.DeleteFailed", string.Join(", ", result.Errors.Select(e => e.Description))));

        return Result<bool>.Success(true);
    }
}