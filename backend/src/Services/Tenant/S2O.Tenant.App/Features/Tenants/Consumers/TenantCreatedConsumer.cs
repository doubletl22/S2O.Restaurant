using MassTransit;
using S2O.Tenant.App.Abstractions;
using S2O.Tenant.App.Features.Plans;
using S2O.Tenant.Domain.Entities;
using S2O.Shared.Kernel.IntegrationEvents;

public class TenantCreatedConsumer : IConsumer<TenantCreatedEvent>
{
    private readonly ITenantDbContext _context;

    public TenantCreatedConsumer(ITenantDbContext context) => _context = context;

    public async Task Consume(ConsumeContext<TenantCreatedEvent> context)
    {
        var msg = context.Message;
        var normalizedPlan = PlanPolicy.Normalize(msg.PlanType);

        // Lưu vào bảng Tenants
        _context.Tenants.Add(new Tenant
        {
            Id = msg.TenantId,
            Name = msg.RestaurantName,
            Address = msg.Address,
            PhoneNumber = msg.Phone,
            SubscriptionPlan = normalizedPlan,
            SubscriptionExpiry = DateTime.UtcNow.AddMonths(1),
            IsLocked = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        // Lưu vào bảng Branches
        _context.Branches.Add(new Branch
        {
            Id = msg.DefaultBranchId,
            TenantId = msg.TenantId,
            Name = "Chi nhánh mặc định",
            Address = msg.Address,
            PhoneNumber = msg.Phone
        });

        await _context.SaveChangesAsync(context.CancellationToken);
    }
}