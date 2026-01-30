using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.SaaS;

public record RegisterTenantCommand(
    string RestaurantName,
    string OwnerName,
    string Email,
    string Password,
    string Address,        
    string PhoneNumber,          
    string PlanType
) : IRequest<Result<Guid>>;