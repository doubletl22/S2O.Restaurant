using MediatR;
using S2O.Shared.Kernel.Results; 
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Branches.Commands;

public class UpdateBranchHandler : IRequestHandler<UpdateBranchCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;

    public UpdateBranchHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(UpdateBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await _context.Branches.FindAsync(new object[] { request.Id }, cancellationToken);

        if (branch == null)
        {
            return Result<Guid>.Failure(new Error("Branch.NotFound", "Không tìm thấy chi nhánh"));
        }

        branch.Name = request.Name;
        branch.Address = request.Address;
        branch.PhoneNumber = request.PhoneNumber;
        branch.IsActive = request.IsActive;

        _context.Branches.Update(branch);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(branch.Id);
    }
}