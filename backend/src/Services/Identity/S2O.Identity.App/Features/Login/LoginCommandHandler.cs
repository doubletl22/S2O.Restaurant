using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using S2O.Identity.App.Services; 

namespace S2O.Identity.App.Features.Login;

public class LoginHandler : IRequestHandler<LoginCommand, Result<string>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;

    public LoginHandler(UserManager<ApplicationUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<Result<string>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra User tồn tại
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result<string>.Failure(new Error("Auth.UserNotFound", "Email không tồn tại"));

        // 2. Kiểm tra mật khẩu
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            return Result<string>.Failure(new Error("Auth.InvalidPassword", "Mật khẩu không đúng"));

        // 3. TẠO TOKEN THẬT (Thay cho chuỗi "fake-jwt-token")
        var token = _tokenService.CreateToken(user);

        return Result<string>.Success(token);
    }
}