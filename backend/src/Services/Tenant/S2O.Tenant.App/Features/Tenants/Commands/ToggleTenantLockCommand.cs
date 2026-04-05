using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tenants.Commands;
public record ToggleTenantLockCommand(Guid TenantId, bool IsLocked, bool? IsToggle = null) : IRequest<Result>;

public class ToggleTenantLockHandler : IRequestHandler<ToggleTenantLockCommand, Result>
{
    private readonly ITenantDbContext _context;

    public ToggleTenantLockHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(ToggleTenantLockCommand request, CancellationToken ct)
    {
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == request.TenantId, ct);
        if (tenant == null) return Result.Failure(new Error("Tenant.NotFound", "Không tìm thấy nhà hàng"));

        // If IsToggle is true, toggle the state; otherwise set to IsLocked value
        tenant.IsLocked = request.IsToggle.HasValue && request.IsToggle.Value ? !tenant.IsLocked : request.IsLocked;
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}