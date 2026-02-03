using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public record RegisterStaffCommand(
    string FullName,
    string Email,        
    string Password,
    string PhoneNumber,
    Guid BranchId,
    string Role,         
    Guid TenantId        
) : IRequest<Result<Guid>>;