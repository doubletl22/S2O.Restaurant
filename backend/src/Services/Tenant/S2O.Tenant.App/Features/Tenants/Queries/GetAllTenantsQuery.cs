using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.App.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Tenant.App.Features.Tenants.Queries;

// DTO trả về
public record TenantDto(Guid Id, string Name, string Plan, bool IsLocked, DateTime CreatedAt);

public record GetAllTenantsQuery(string? Keyword = null) : IRequest<Result<List<TenantDto>>>;

public class GetAllTenantsHandler : IRequestHandler<GetAllTenantsQuery, Result<List<TenantDto>>>
{
    private readonly ITenantDbContext _context;

    public GetAllTenantsHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<TenantDto>>> Handle(GetAllTenantsQuery request, CancellationToken ct)
    {
        // Super Admin được quyền xem hết, không lọc theo TenantId
        var query = _context.Tenants
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(keyword));
        }

        var tenants = await query
            .Select(t => new TenantDto(t.Id, t.Name, t.SubscriptionPlan, t.IsLocked, t.CreatedAt))
            .ToListAsync(ct);

        return Result<List<TenantDto>>.Success(tenants);
    }
}