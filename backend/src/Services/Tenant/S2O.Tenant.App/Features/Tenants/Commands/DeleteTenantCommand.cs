using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tenants.Commands;

public record DeleteTenantCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteTenantHandler : IRequestHandler<DeleteTenantCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public DeleteTenantHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteTenantCommand request, CancellationToken ct)
    {
        var tenant = await _context.Tenants.FindAsync(new object[] { request.Id }, ct);
        if (tenant == null) return Result<bool>.Failure(new Error("Tenant.NotFound", "Không tìm thấy nhà hàng"));

        var tables = await _context.Tables
            .IgnoreQueryFilters()
            .Where(t => t.TenantId == request.Id)
            .ToListAsync(ct);

        var branches = await _context.Branches
            .IgnoreQueryFilters()
            .Where(b => b.TenantId == request.Id)
            .ToListAsync(ct);

        if (tables.Count > 0)
        {
            _context.Tables.RemoveRange(tables);
        }

        if (branches.Count > 0)
        {
            _context.Branches.RemoveRange(branches);
        }

        _context.Tenants.Remove(tenant);

        await _context.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}