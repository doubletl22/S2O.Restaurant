using S2O.Shared.Kernel.Primitives;

namespace S2O.Tenant.Domain.Entities;

public class Table : Entity, IMustHaveTenant
{
    public Guid? TenantId { get; set; }
    public Guid? BranchId { get; set; }
    public string Name { get; set; } = default!;
    public int Capacity { get; set; }
    public string? QrCodeUrl { get; set; } 
    public bool IsOccupied { get; set; } = false;
    public bool IsActive { get; set; } = true;
}