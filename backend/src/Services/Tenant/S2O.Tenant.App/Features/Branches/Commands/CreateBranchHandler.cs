using MediatR;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;
using S2O.Tenant.Domain.Entities; // Đảm bảo đã có Entity Branch

namespace S2O.Tenant.App.Features.Branches.Commands;

public class CreateBranchHandler : IRequestHandler<CreateBranchCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CreateBranchHandler(ITenantDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(CreateBranchCommand request, CancellationToken cancellationToken)
    {
        if (_tenantContext.TenantId == Guid.Empty)
        {
            return Result<Guid>.Failure(Error.Failure("Auth.NoTenant", "Không xác định được Tenant (Vui lòng đăng nhập lại)."));
        }
        // 1. Tạo Entity Branch mới
        var branch = new Branch
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            Name = request.Name,
            Address = request.Address,
            PhoneNumber = request.Phone,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        // 2. Lưu vào DB
        _context.Branches.Add(branch);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(branch.Id);
    }
}