using S2O.Shared.Kernel.Primitives;

namespace S2O.Tenant.Domain.Entities;

public class Branch : Entity, IMustHaveTenant
{
    public Guid? TenantId { get; set; } 
    public string Name { get; set; } = default!;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;

}