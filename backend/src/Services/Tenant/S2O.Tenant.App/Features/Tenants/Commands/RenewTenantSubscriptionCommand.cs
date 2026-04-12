using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;
using S2O.Tenant.App.Features.Plans;

namespace S2O.Tenant.App.Features.Tenants.Commands;

public record RenewTenantSubscriptionCommand(Guid TenantId, int Months = 1) : IRequest<Result>;

public class RenewTenantSubscriptionHandler : IRequestHandler<RenewTenantSubscriptionCommand, Result>
{
    private readonly ITenantDbContext _context;

    public RenewTenantSubscriptionHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(RenewTenantSubscriptionCommand request, CancellationToken ct)
    {
        if (request.Months <= 0 || request.Months > 24)
        {
            return Result.Failure(new Error("Tenant.InvalidRenewMonths", "Số tháng gia hạn phải từ 1 đến 24."));
        }

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == request.TenantId, ct);
        if (tenant == null)
        {
            return Result.Failure(new Error("Tenant.NotFound", "Không tìm thấy nhà hàng"));
        }

        tenant.SubscriptionPlan = PlanPolicy.Normalize(tenant.SubscriptionPlan);
        var startAt = tenant.SubscriptionExpiry > DateTime.UtcNow ? tenant.SubscriptionExpiry : DateTime.UtcNow;
        tenant.SubscriptionExpiry = startAt.AddMonths(request.Months);
        tenant.IsLocked = false;
        tenant.IsActive = true;

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
