using Microsoft.AspNetCore.Identity;
using S2O.Auth.App.Abstractions;
using S2O.Auth.Domain.Entities;
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Login;

public class LoginCommandHandler : ICommandHandler<LoginCommand, string>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenProvider _tokenProvider;

    public LoginCommandHandler(UserManager<ApplicationUser> userManager, ITokenProvider tokenProvider)
    {
        _userManager = userManager;
        _tokenProvider = tokenProvider;
    }

    public async Task<Result<string>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Xác thực người dùng qua Email 
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Result<string>.Failure(new Error("Auth.Unauthorized", "Tài khoản hoặc mật khẩu không đúng."));
        }

        // Lấy danh sách Role để phân quyền RBAC (Admin, Owner, Staff, Customer) 
        var roles = await _userManager.GetRolesAsync(user);

        // Tạo chuỗi JWT chứa TenantId để cô lập dữ liệu 
        var token = _tokenProvider.Create(user, roles);

        return Result<string>.Success(token);
    }
}