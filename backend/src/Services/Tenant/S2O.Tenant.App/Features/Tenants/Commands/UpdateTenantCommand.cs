using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tenants.Commands;

public record UpdateTenantCommand(
    Guid Id,
    string Name,
    string? Address,
    string? PhoneNumber,
    string? SubscriptionPlan // Cho phép admin đổi gói dịch vụ
) : IRequest<Result<Guid>>;

public class UpdateTenantHandler : IRequestHandler<UpdateTenantCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;

    public UpdateTenantHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(UpdateTenantCommand request, CancellationToken ct)
    {
        var tenant = await _context.Tenants.FindAsync(new object[] { request.Id }, ct);
        if (tenant == null) return Result<Guid>.Failure(new Error("Tenant.NotFound", "Không tìm thấy nhà hàng"));

        // Cập nhật thông tin
        tenant.Name = request.Name;
        tenant.Address = request.Address;
        tenant.PhoneNumber = request.PhoneNumber;
        if (!string.IsNullOrEmpty(request.SubscriptionPlan))
        {
            tenant.SubscriptionPlan = request.SubscriptionPlan;
        }

        await _context.SaveChangesAsync(ct);
        return Result<Guid>.Success(tenant.Id);
    }
}