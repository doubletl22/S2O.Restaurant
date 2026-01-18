using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using System.Security.Claims;

namespace S2O.Identity.App.Features.SaaS;

public class RegisterTenantHandler : IRequestHandler<RegisterTenantCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public RegisterTenantHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<Guid>> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Email tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure(new Error("Identity.DuplicateEmail", "Email này đã được sử dụng."));
        }

        // 2. Sinh TenantId mới (Đây là ID định danh cho cả nhà hàng)
        var newTenantId = Guid.NewGuid();

        // 3. Tạo User (Owner)
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.OwnerName,
            IsActive = true,

            // Lưu ý: ApplicationUser của bạn cần có trường TenantId (hoặc lưu trong Claim)
            // Nếu bạn đã map TenantId vào Entity ApplicationUser thì gán ở đây:
            // TenantId = newTenantId 
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Result<Guid>.Failure(new Error("Identity.Error", createResult.Errors.First().Description));
        }

        // 4. Gán Role "Owner"
        await _userManager.AddToRoleAsync(user, "Owner");

        // 5. Quan trọng: Thêm Claims định danh Tenant
        // Khi ông này đăng nhập, Token sẽ chứa tenant_id này -> Dữ liệu Catalog/Order sẽ lọc theo nó.
        var claims = new List<Claim>
        {
            new Claim("tenant_id", newTenantId.ToString()),
            new Claim("plan", request.PlanType),
            new Claim("restaurant_name", request.RestaurantName)
        };
        await _userManager.AddClaimsAsync(user, claims);

        // TODO: Ở bước này, trong hệ thống Microservices chuẩn, bạn nên bắn một Event (Message Queue)
        // Gửi: "TenantCreatedEvent" -> Tenant Service lắng nghe để tạo bản ghi trong bảng Tenants.
        // Nhưng tạm thời ta dùng Claims để định danh là đủ chạy.

        return Result<Guid>.Success(newTenantId);
    }
}