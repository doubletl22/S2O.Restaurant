using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Abstractions; // Thêm using này để dùng ICommandHandler
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Login;

// SỬA TẠI ĐÂY: Sử dụng ICommandHandler<LoginCommand, string>
// Nó sẽ tự động hiểu kiểu trả về cần thiết là Result<string>
public class LoginHandler : ICommandHandler<LoginCommand, string>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;

    public LoginHandler(UserManager<ApplicationUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    // Kiểu trả về Task<Result<string>> bây giờ sẽ khớp hoàn toàn với Interface
    public async Task<Result<string>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Sử dụng IgnoreQueryFilters để tìm User có TenantId khác null
        // Nên sử dụng NormalizedEmail để khớp chính xác với chuẩn của ASP.NET Identity
        var user = await _userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.NormalizedEmail == request.Email.ToUpper(), cancellationToken);

        if (user == null)
            return Result<string>.Failure(new Error("Auth.UserNotFound", "Tài khoản chủ nhà hàng không tồn tại"));

        // 2. Kiểm tra mật khẩu
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            return Result<string>.Failure(new Error("Auth.InvalidPassword", "Mật khẩu không chính xác"));

        // 3. Tạo Token (Token này sẽ chứa TenantId của chủ nhà hàng)
        var token = _tokenService.CreateToken(user);

        return Result<string>.Success(token);
    }}