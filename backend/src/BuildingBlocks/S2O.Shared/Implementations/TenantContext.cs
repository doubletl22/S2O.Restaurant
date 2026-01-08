using S2O.Shared.Interfaces;

namespace S2O.Shared.Implementations;

public class TenantContext : ITenantContext
{
    public string? TenantId { get; set; }
}