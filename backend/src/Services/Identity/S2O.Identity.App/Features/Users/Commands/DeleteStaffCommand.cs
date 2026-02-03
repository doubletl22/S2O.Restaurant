using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Commands;

public record DeleteStaffCommand(
    Guid UserId,
    Guid TenantId 
) : IRequest<Result<bool>>;