using S2O.Shared.Interfaces;

namespace S2O.Shared.Implementations;

public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; set; }
    public string? Email { get; set; }
}