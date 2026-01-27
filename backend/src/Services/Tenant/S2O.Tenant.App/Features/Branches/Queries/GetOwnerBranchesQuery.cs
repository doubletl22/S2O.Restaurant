using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Branches.Queries;

// Chi nhánh thường ít nên có thể Get All không cần phân trang, hoặc phân trang tùy ý
public record GetOwnerBranchesQuery() : IRequest<Result<List<BranchDto>>>;

public class BranchDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string PhoneNumber { get; set; }
    public bool IsActive { get; set; }
}

public class GetOwnerBranchesHandler : IRequestHandler<GetOwnerBranchesQuery, Result<List<BranchDto>>>
{
    private readonly ITenantDbContext _context;

    public GetOwnerBranchesHandler(ITenantDbContext context) => _context = context;

    public async Task<Result<List<BranchDto>>> Handle(GetOwnerBranchesQuery request, CancellationToken ct)
    {
        // Tự động lọc theo TenantId nhờ Global Filter
        var branches = await _context.Branches
            .AsNoTracking()
            .OrderBy(b => b.Name)
            .Select(b => new BranchDto
            {
                Id = b.Id,
                Name = b.Name,
                Address = b.Address,
                PhoneNumber = b.PhoneNumber,
                IsActive = b.IsActive
            })
            .ToListAsync(ct);

        return Result<List<BranchDto>>.Success(branches);
    }
}