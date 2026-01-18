using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore; 
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using S2O.Identity.App.Services;
using S2O.Identity.App.Abstractions;
namespace S2O.Identity.App.Features.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<string>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IAuthDbContext _context; // Inject DbContext trực tiếp

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        IAuthDbContext context)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
    }

    public async Task<Result<string>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
           var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
            return Result<string>.Failure(new Error("Auth.UserNotFound", "Email không tồn tại hoặc sai Tenant"));

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
            return Result<string>.Failure(new Error("Auth.InvalidPassword", "Mật khẩu không đúng"));

        var token = _tokenService.CreateToken(user);

        return Result<string>.Success(token);
    }
}