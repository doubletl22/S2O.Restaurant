using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using S2O.Identity.App.DTOs; // Import namespace DTO

namespace S2O.Identity.App.Features.Login;

// 👇 1. Sửa interface trả về Result<LoginResponse>
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

    // 👇 2. Sửa kiểu trả về của hàm Handle
    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        // 👇 Sửa kiểu trả về Failure cho khớp
        if (user == null)
            return Result<LoginResponse>.Failure(new Error("Auth.UserNotFound", "Email không tồn tại"));

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
            return Result<LoginResponse>.Failure(new Error("Auth.InvalidPassword", "Mật khẩu không đúng"));

        // Lấy Roles thật từ DB
        var roles = await _userManager.GetRolesAsync(user);

        // Tạo JWT Token
        var token = _tokenService.CreateToken(user, roles);

        // 👇 3. Tạo object response đầy đủ (Token + User Info)
        var response = new LoginResponse(
            AccessToken: token,
            User: new UserDto(
                Id: user.Id.ToString(),
                Email: user.Email ?? "",
                FullName: user.FullName ?? "User",
                Roles: roles.ToList()
            )
        );

        return Result<LoginResponse>.Success(response);
    }
}