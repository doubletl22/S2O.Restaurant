using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;
// using S2O.Tenant.Domain.Entities; // Không cần dùng Entity trực tiếp nữa

namespace S2O.Tenant.App.Features.Tables;

// Thêm tham số BranchId (Nullable) để Frontend có thể lọc bàn theo chi nhánh nếu muốn
public record GetTablesQuery(Guid? BranchId = null) : IRequest<Result<List<TableResponse>>>;

public class GetTablesHandler : IRequestHandler<GetTablesQuery, Result<List<TableResponse>>>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;

    public GetTablesHandler(ITenantDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<List<TableResponse>>> Handle(GetTablesQuery request, CancellationToken ct)
    {
        // 1. Kiểm tra Tenant
        if (_tenantContext.TenantId == null)
        {
            return Result<List<TableResponse>>.Failure(new Error("Auth.NoTenant", "Chưa xác định được Tenant."));
        }

        // 2. Query
        var query = _context.Tables.AsNoTracking()
            .Where(t => t.TenantId == _tenantContext.TenantId.Value);

        // Nếu có truyền BranchId thì lọc thêm
        if (request.BranchId.HasValue && request.BranchId != Guid.Empty)
        {
            query = query.Where(t => t.BranchId == request.BranchId.Value);
        }

        // 3. Map sang DTO (TableResponse)
        var tables = await query.Select(t => new TableResponse
        {
            Id = t.Id,
            Name = t.Name,
            Capacity = t.Capacity,
            TenantId = t.TenantId ?? Guid.Empty,
            BranchId = t.BranchId ?? Guid.Empty,
            QrCodeGuid = t.QrCodeUrl ?? string.Empty
        })
        .OrderBy(t => t.Name)
        .ToListAsync(ct);

        return Result<List<TableResponse>>.Success(tables);
    }
}