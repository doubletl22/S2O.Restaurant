using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Tenant.App.Features.Branches.Commands;

public class UpdateBranchCommand : IRequest<Result<Guid>>
{
    public Guid Id { get; set; } 
    public string Name { get; set; } = default!;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
}