using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Queries;

public class GetOrdersHandler : IQueryHandler<GetOrdersQuery, List<Domain.Entities.Order>>
{
    private readonly IOrderDbContext _context;
    private readonly ITenantContext _tenantContext;

    public GetOrdersHandler(IOrderDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<List<Domain.Entities.Order>>> Handle(GetOrdersQuery request, CancellationToken ct)
    {
        var orders = await _context.Orders
            .Include(o => o.Items) 
            .OrderByDescending(o => o.CreatedAtUtc) 
            .ToListAsync(ct);

        return Result<List<Domain.Entities.Order>>.Success(orders);
    }
}