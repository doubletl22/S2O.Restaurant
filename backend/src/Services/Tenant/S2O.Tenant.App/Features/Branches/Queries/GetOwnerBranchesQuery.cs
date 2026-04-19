using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Branches.Queries;

// Chi nhánh thường ít nên có thể Get All không cần phân trang, hoặc phân trang tùy ý
public record GetOwnerBranchesQuery() : IRequest<Result<List<BranchDto>>>;

public class BranchDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class GetOwnerBranchesHandler : IRequestHandler<GetOwnerBranchesQuery, Result<List<BranchDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;

    public GetOwnerBranchesHandler(ITenantDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<List<BranchDto>>> Handle(GetOwnerBranchesQuery request, CancellationToken ct)
    {
        if (_tenantContext.TenantId == null || _tenantContext.TenantId == Guid.Empty)
        {
            return Result<List<BranchDto>>.Failure(
                Error.Failure("Auth.NoTenant", "Khong xac dinh duoc tenant tu token."));
        }

        var tenantId = _tenantContext.TenantId.Value;

        var branches = await _context.Branches
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId)
            .OrderBy(b => b.Name)
            .Select(b => new BranchDto
            {
                Id = b.Id,
                Name = b.Name,
                Address = b.Address ?? "",
                Phone = b.PhoneNumber ?? "",
                IsActive = b.IsActive
            })
            .ToListAsync(ct);

        return Result<List<BranchDto>>.Success(branches);
    }
}