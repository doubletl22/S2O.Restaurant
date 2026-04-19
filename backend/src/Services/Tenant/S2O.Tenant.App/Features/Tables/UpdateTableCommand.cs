using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tables;

public record UpdateTableCommand(Guid Id, string Name, int Capacity, bool IsActive, bool IsOccupied = false) : IRequest<Result<Guid>>;

public class UpdateTableHandler : IRequestHandler<UpdateTableCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;

    public UpdateTableHandler(ITenantDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(UpdateTableCommand request, CancellationToken ct)
    {
        if (_tenantContext.TenantId == null || _tenantContext.TenantId == Guid.Empty)
            return Result<Guid>.Failure(new Error("Auth.NoTenant", "Khong xac dinh duoc tenant tu token."));

        var tenantId = _tenantContext.TenantId.Value;

        var table = await _context.Tables
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.TenantId == tenantId, ct);

        if (table == null) return Result<Guid>.Failure(new Error("Table.NotFound", "Bàn không tồn tại hoặc bạn không có quyền sửa"));

        // Validate Name
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result<Guid>.Failure(new Error("Table.NameRequired", "Tên bàn không được để trống."));

        if (request.Name.Length > 50)
            return Result<Guid>.Failure(new Error("Table.NameTooLong", "Tên bàn không được quá 50 ký tự."));

        if (request.Capacity <= 0)
            return Result<Guid>.Failure(new Error("Table.CapacityInvalid", "Sức chứa phải lớn hơn 0."));

        table.Name = request.Name;
        table.Capacity = request.Capacity;
        table.IsActive = request.IsActive;
        table.IsOccupied = request.IsOccupied;

        await _context.SaveChangesAsync(ct);
        return Result<Guid>.Success(table.Id);
    }
}