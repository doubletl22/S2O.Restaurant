using S2O.Shared.Kernel.Primitives;

namespace S2O.Tenant.Domain.Entities;

public class Table : Entity, IMustHaveTenant
{
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = default!; // Ví dụ: "Bàn số 1"
    public string? QrCodeUrl { get; set; } // Link QR dẫn đến web gọi món
    public bool IsOccupied { get; set; } = false;
}