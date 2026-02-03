using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Tenant.App.Features.Branches.Commands;

public record DeleteBranchCommand(Guid Id) : IRequest<Result<Guid>>;