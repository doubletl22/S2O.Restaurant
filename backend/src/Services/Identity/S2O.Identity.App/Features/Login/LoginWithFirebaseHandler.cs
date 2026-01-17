using FirebaseAdmin.Auth;
using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.App.Services; // Để dùng TokenService
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Login;

public class LoginWithFirebaseHandler : IRequestHandler<LoginWithFirebaseCommand, Result<string>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;

    public LoginWithFirebaseHandler(UserManager<ApplicationUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<Result<string>> Handle(LoginWithFirebaseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Xác thực Token với Google Server
            var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.FirebaseToken, cancellationToken);
            string uid = decodedToken.Uid;
            string email = decodedToken.Claims.ContainsKey("email") ? decodedToken.Claims["email"].ToString()! : "";
            string name = decodedToken.Claims.ContainsKey("name") ? decodedToken.Claims["name"].ToString()! : "Khách hàng";

            // (Nếu dùng đăng nhập SĐT, email có thể rỗng -> xử lý logic riêng)
            if (string.IsNullOrEmpty(email))
            {
                // Fallback: Tạo email giả từ UID nếu login bằng Phone
                email = $"{uid}@firebase.user";
            }

            // 2. Kiểm tra User đã tồn tại trong DB S2O chưa?
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                // 3. Nếu chưa -> Tự động Đăng ký (Auto Register)
                user = new ApplicationUser
                {
                    UserName = email, // Username phải unique
                    Email = email,
                    FullName = name,
                    TenantId = request.TenantId, // Gắn khách vào quán này
                    BranchId = null, // Khách không quản lý chi nhánh
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };

                // Tạo user không cần password (vì dùng Google)
                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return Result<string>.Failure(new Error("Auth.CreateFailed", "Lỗi tạo tài khoản từ Firebase"));
                }

                await _userManager.AddToRoleAsync(user, "Customer");
            }

            // 4. Tạo JWT Token nội bộ (Giống hệt luồng Login thường)
            var token = _tokenService.CreateToken(user);

            return Result<string>.Success(token);
        }
        catch (FirebaseAuthException)
        {
            return Result<string>.Failure(new Error("Auth.InvalidToken", "Token Firebase không hợp lệ hoặc đã hết hạn."));
        }
        catch (Exception ex)
        {
            return Result<string>.Failure(new Error("Auth.Error", ex.Message));
        }
    }
}