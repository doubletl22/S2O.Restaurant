using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.SaaS;

public record RegisterTenantCommand(
    string RestaurantName,
    string OwnerName,
    string Email,
    string Password,
    string Address,        // Bổ sung địa chỉ cho chi nhánh đầu tiên
    string PhoneNumber,          // Bổ sung số điện thoại
    string PlanType
) : IRequest<Result<Guid>>;