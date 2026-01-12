using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.Domain.Entities;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tables;

public record GetTablesQuery() : IRequest<Result<List<Table>>>;

public class GetTablesHandler : IRequestHandler<GetTablesQuery, Result<List<Table>>>
{
    private readonly ITenantDbContext _context;

    public GetTablesHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<Table>>> Handle(GetTablesQuery request, CancellationToken ct)
    {
        // TenantInterceptor sẽ tự động lọc bàn của nhà hàng hiện tại
        var tables = await _context.Tables.ToListAsync(ct);
        return Result<List<Table>>.Success(tables);
    }
}