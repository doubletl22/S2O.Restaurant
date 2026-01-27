using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Branches.Commands;

public record UpdateBranchCommand(Guid Id, string Name, string Address, string PhoneNumber, bool IsActive) : IRequest<Result<Guid>>;

public class UpdateBranchHandler : IRequestHandler<UpdateBranchCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;

    public UpdateBranchHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(UpdateBranchCommand request, CancellationToken ct)
    {
        var branch = await _context.Branches.FindAsync(new object[] { request.Id }, ct);
        if (branch == null) return Result<Guid>.Failure(new Error("Branch.NotFound", "Chi nhánh không tồn tại"));

        branch.Name = request.Name;
        branch.Address = request.Address;
        branch.PhoneNumber = request.PhoneNumber;
        branch.IsActive = request.IsActive;

        await _context.SaveChangesAsync(ct);
        return Result<Guid>.Success(branch.Id);
    }
}