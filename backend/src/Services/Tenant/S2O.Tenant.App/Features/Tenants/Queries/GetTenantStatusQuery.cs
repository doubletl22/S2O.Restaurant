using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.App.Abstractions;
using S2O.Tenant.App.Features.Plans;
using S2O.Shared.Kernel.Results;

namespace S2O.Tenant.App.Features.Tenants.Queries;

// Internal DTO for checking tenant lock/active status during login
public record TenantStatusDto(
    bool IsLocked,
    bool IsActive,
    string Name,
    string SubscriptionPlan,
    DateTime SubscriptionExpiry,
    bool IsSubscriptionExpired,
    string? LockReason,
    DateTime? LockedAtUtc,
    DateTime? LockedUntilUtc);

public record GetTenantStatusQuery(Guid TenantId) : IRequest<Result<TenantStatusDto>>;

public class GetTenantStatusHandler : IRequestHandler<GetTenantStatusQuery, Result<TenantStatusDto>>
{
    private readonly ITenantDbContext _context;

    public GetTenantStatusHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TenantStatusDto>> Handle(GetTenantStatusQuery request, CancellationToken ct)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, ct);

        if (tenant == null)
        {
            return Result<TenantStatusDto>.Failure(new Error("Tenant.NotFound", "Không tìm thấy nhà hàng"));
        }

        if (tenant.SubscriptionExpiry != default && tenant.SubscriptionExpiry < DateTime.UtcNow && !tenant.IsLocked)
        {
            tenant.IsLocked = true;
            await _context.SaveChangesAsync(ct);
        }

        var isExpired = tenant.SubscriptionExpiry != default && tenant.SubscriptionExpiry < DateTime.UtcNow;
        var statusDto = new TenantStatusDto(
            tenant.IsLocked,
            tenant.IsActive,
            tenant.Name,
            PlanPolicy.Normalize(tenant.SubscriptionPlan),
            tenant.SubscriptionExpiry,
            isExpired,
            tenant.LockReason,
            tenant.LockedAtUtc,
            tenant.LockedUntilUtc);
        return Result<TenantStatusDto>.Success(statusDto);
    }
}
