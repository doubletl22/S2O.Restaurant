using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.DTOs;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using System.Text.Json;

namespace S2O.Identity.App.Features.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IAuthDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        IAuthDbContext context,
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm User
        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
            return Result<LoginResponse>.Failure(new Error("Auth.UserNotFound", "Email không tồn tại"));

        // 2. Kiểm tra User bị disable
        if (!user.IsActive)
            return Result<LoginResponse>.Failure(new Error("Auth.UserDisabled", "Tài khoản của bạn đã bị vô hiệu hóa. Liên hệ quản trị viên để biết thêm chi tiết"));

        // 3. Kiểm tra User bị khóa (Lockout)
        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
            return Result<LoginResponse>.Failure(new Error("Auth.UserLocked", "Tài khoản của bạn đã bị khóa. Vui lòng thử lại sau"));

        // 4. Kiểm tra Tenant (if user has TenantId)
        if (user.TenantId.HasValue)
        {
            var tenantStatusResult = await CheckTenantStatusAsync(user.TenantId.Value, cancellationToken);
            if (!tenantStatusResult.IsSuccess)
                return Result<LoginResponse>.Failure(tenantStatusResult.Error);
        }

        // 5. Check Password
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
            return Result<LoginResponse>.Failure(new Error("Auth.InvalidPassword", "Mật khẩu không đúng"));

        // 6. Lấy Roles
        var roles = await _userManager.GetRolesAsync(user);

        // 7. Tạo Token
        var token = _tokenService.CreateToken(user, roles);

        // 8. Trả về Result
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

    private async Task<Result> CheckTenantStatusAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var tenantApiBaseUrl = _configuration["ExternalServices:TenantApiBaseUrl"];
            if (string.IsNullOrWhiteSpace(tenantApiBaseUrl))
            {
                // If tenant service URL not configured, allow login (fallback)
                return Result.Success();
            }

            var url = $"{tenantApiBaseUrl.TrimEnd('/')}/api/v1/tenants/{tenantId}/check-lock-status";
            
            using var response = await _httpClient.GetAsync(url, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                // If tenant service is down, allow login (fallback to not break functionality)
                return Result.Success();
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            using var document = JsonDocument.Parse(content);
            var root = document.RootElement;

            // Parse response: { isSuccess: true, value: { isLocked: bool, isActive: bool, name: string } }
            if (root.TryGetProperty("value", out var valueElement))
            {
                bool isLocked = false;
                bool isActive = true;

                if (valueElement.TryGetProperty("isLocked", out var lockedProperty))
                    isLocked = lockedProperty.GetBoolean();

                if (valueElement.TryGetProperty("isActive", out var activeProperty))
                    isActive = activeProperty.GetBoolean();

                if (isLocked)
                    return Result.Failure(new Error("Auth.TenantLocked", "Cửa hàng của bạn đã bị khóa. Liên hệ quản trị viên để biết thêm chi tiết"));

                if (!isActive)
                    return Result.Failure(new Error("Auth.TenantInactive", "Cửa hàng của bạn không hoạt động. Liên hệ quản trị viên để biết thêm chi tiết"));
            }

            return Result.Success();
        }
        catch
        {
            // If any error occurs during tenant check, allow login (failsafe)
            return Result.Success();
        }
    }
}