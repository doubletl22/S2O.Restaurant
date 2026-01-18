using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.SaaS;

public record RegisterTenantCommand(
    string RestaurantName, // Tên nhà hàng (VD: Phở Cồ)
    string OwnerName,      // Tên chủ quán
    string Email,          // Email đăng nhập
    string Password,       // Mật khẩu cấp trước
    string PlanType        // Gói cước: "Basic", "Premium"
) : IRequest<Result<Guid>>;