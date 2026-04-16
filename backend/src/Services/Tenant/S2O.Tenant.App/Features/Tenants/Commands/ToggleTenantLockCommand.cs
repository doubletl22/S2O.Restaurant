using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tenants.Commands;
public record ToggleTenantLockCommand(
    Guid TenantId,
    bool IsLocked,
    bool? IsToggle = null,
    string? LockReason = null,
    int? LockDurationDays = null,
    bool IsPermanent = false) : IRequest<Result>;

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

        var targetIsLocked = request.IsToggle.HasValue && request.IsToggle.Value ? !tenant.IsLocked : request.IsLocked;
        var isExpired = tenant.SubscriptionExpiry != default && tenant.SubscriptionExpiry < DateTime.UtcNow;

        if (targetIsLocked)
        {
            if (tenant.IsLocked)
            {
                return Result.Failure(new Error("Tenant.AlreadyLocked", "Nhà hàng đã ở trạng thái bị khóa."));
            }

            if (string.IsNullOrWhiteSpace(request.LockReason))
            {
                return Result.Failure(new Error("Tenant.LockReasonRequired", "Lý do khóa là bắt buộc."));
            }

            // If not permanent, validate duration
            if (!request.IsPermanent)
            {
                if (!request.LockDurationDays.HasValue || request.LockDurationDays.Value is < 1 or > 365)
                {
                    return Result.Failure(new Error("Tenant.InvalidLockDuration", "Thời hạn khóa phải trong khoảng từ 1 đến 365 ngày."));
                }
            }

            tenant.IsLocked = true;
            tenant.LockReason = request.LockReason.Trim();
            tenant.LockedAtUtc = DateTime.UtcNow;
            
            // If permanent, set expiry to year 9999; otherwise add days
            if (request.IsPermanent)
            {
                tenant.LockedUntilUtc = new DateTime(9999, 12, 31, 23, 59, 59, DateTimeKind.Utc);
            }
            else
            {
                tenant.LockedUntilUtc = DateTime.UtcNow.AddDays(request.LockDurationDays!.Value);
            }

            await _context.SaveChangesAsync(ct);
            return Result.Success();
        }

        if (!targetIsLocked && isExpired)
        {
            return Result.Failure(new Error("Tenant.SubscriptionExpired", "Gói dịch vụ đã hết hạn. Vui lòng gia hạn trước khi mở khóa."));
        }

        tenant.IsLocked = false;
        tenant.LockReason = null;
        tenant.LockedAtUtc = null;
        tenant.LockedUntilUtc = null;

        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}