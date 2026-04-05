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
        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == request.Id, ct);
        
        if (tenant == null) 
            return Result<bool>.Failure(new Error("Tenant.NotFound", "Không tìm thấy nhà hàng"));

        // ✅ Soft-delete: Mark tenant as deleted instead of physically removing
        tenant.IsDeleted = true;
        tenant.DeletedAtUtc = DateTime.UtcNow;
        _context.Tenants.Update(tenant);

        // ✅ Cascade soft-delete: Mark all branches as deleted
        var branches = await _context.Branches
            .IgnoreQueryFilters()
            .Where(b => b.TenantId == request.Id)
            .ToListAsync(ct);

        foreach (var branch in branches)
        {
            branch.IsDeleted = true;
            branch.DeletedAtUtc = DateTime.UtcNow;
            _context.Branches.Update(branch);
        }

        // ✅ Cascade soft-delete: Mark all tables as deleted
        var tables = await _context.Tables
            .IgnoreQueryFilters()
            .Where(t => t.TenantId == request.Id)
            .ToListAsync(ct);

        foreach (var table in tables)
        {
            table.IsDeleted = true;
            table.DeletedAtUtc = DateTime.UtcNow;
            _context.Tables.Update(table);
        }

        await _context.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}