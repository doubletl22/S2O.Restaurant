using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tenants.Commands;
public record ToggleTenantLockCommand(Guid TenantId, bool IsLocked) : IRequest<Result>;

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

        tenant.IsLocked = request.IsLocked; // Cập nhật trạng thái
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}