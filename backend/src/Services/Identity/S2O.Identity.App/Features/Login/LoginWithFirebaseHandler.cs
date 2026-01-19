using FirebaseAdmin.Auth;
using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.App.Services;
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

            // Lấy thông tin an toàn (tránh null)
            string email = decodedToken.Claims.TryGetValue("email", out var emailObj) ? emailObj.ToString()! : "";
            string name = decodedToken.Claims.TryGetValue("name", out var nameObj) ? nameObj.ToString()! : "Khách hàng Google";

            // Fallback: Nếu không lấy được email (ví dụ login sđt), tạo email giả định danh
            if (string.IsNullOrEmpty(email))
            {
                email = $"{uid}@firebase.user";
            }

            // 2. Kiểm tra User đã tồn tại trong DB chưa?
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                // 3. Nếu chưa -> Tự động Đăng ký (Auto Register)
                user = new ApplicationUser
                {
                    UserName = email, // Username là unique key
                    Email = email,
                    FullName = name,
                    TenantId = request.TenantId, // Gắn khách vào quán hiện tại (nếu có)
                    BranchId = null,             // Khách thường không thuộc chi nhánh cụ thể
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow,
                    EmailConfirmed = true        // Google đã xác thực rồi nên set true luôn
                };

                // Tạo user không password
                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    var errorMsg = createResult.Errors.FirstOrDefault()?.Description ?? "Lỗi không xác định";
                    return Result<string>.Failure(Error.Failure("Auth.CreateFailed", errorMsg));
                }

                // Gán quyền Customer mặc định
                await _userManager.AddToRoleAsync(user, "Customer");
            }

            // 4. Lấy danh sách Role để đưa vào Token
            var roles = await _userManager.GetRolesAsync(user);

            // 5. Tạo JWT Token
            // Lưu ý: TokenService.CreateToken phải nhận 2 tham số (user, roles) như đã sửa ở bước trước
            var accessToken = _tokenService.CreateToken(user, roles);

            // Trả về chuỗi Token
            return Result<string>.Success(accessToken);
        }
        catch (FirebaseAuthException)
        {
            return Result<string>.Failure(Error.Validation("Auth.InvalidToken", "Token Google không hợp lệ hoặc đã hết hạn."));
        }
        catch (Exception ex)
        {
            return Result<string>.Failure(Error.Failure("Auth.Error", ex.Message));
        }
    }
}