using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.DTOs; // Đảm bảo đã import namespace chứa LoginResponse và UserDto mới
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IAuthDbContext _context;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        IAuthDbContext context)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm User
        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
            return Result<LoginResponse>.Failure(new Error("Auth.UserNotFound", "Email không tồn tại"));

        // 2. Check Password
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
            return Result<LoginResponse>.Failure(new Error("Auth.InvalidPassword", "Mật khẩu không đúng"));

        // 3. Lấy Roles
        var roles = await _userManager.GetRolesAsync(user);

        // 4. Tạo Token
        var token = _tokenService.CreateToken(user, roles);

        // 5. Trả về Result (Sử dụng LoginResponse mới)
        var response = new LoginResponse(
            AccessToken: token,
            User: new UserDto(
                Id: user.Id.ToString(),
                Email: user.Email ?? "",
                FullName: user.FullName ?? "User",
                Roles: roles.ToList() // Chuyển IList<string> sang List<string>
            )
        );

        return Result<LoginResponse>.Success(response);
    }
}