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

        // Use ExecuteUpdate to avoid re-saving tracked DateTime properties that may have incompatible Kind.
        // We only flip IsDeleted to keep this path resilient against DateTime column type mismatches.
        await _context.Tenants
            .IgnoreQueryFilters()
            .Where(t => t.Id == request.Id)
            .ExecuteUpdateAsync(setters => setters
            .SetProperty(t => t.IsDeleted, true), ct);

        await _context.Branches
            .IgnoreQueryFilters()
            .Where(b => b.TenantId == request.Id)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(b => b.IsDeleted, true), ct);

        await _context.Tables
            .IgnoreQueryFilters()
            .Where(t => t.TenantId == request.Id)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(t => t.IsDeleted, true), ct);

        return Result<bool>.Success(true);
    }
}