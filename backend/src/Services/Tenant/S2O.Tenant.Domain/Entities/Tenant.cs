using S2O.Shared.Kernel.Primitives;

namespace S2O.Tenant.Domain.Entities;

public class Tenant : Entity
{
    // Id của Entity này chính là TenantId được sinh ra từ bên Identity
    public string Name { get; set; } = default!;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;

    // Gói đăng ký: Free, Premium...
    public string SubscriptionPlan { get; set; } = "Free";
    public DateTime SubscriptionExpiry { get; set; }
}