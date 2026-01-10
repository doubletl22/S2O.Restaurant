namespace S2O.Shared.Kernel.Interfaces;

public interface ITenantContext
{
    Guid? TenantId { get; set; }
    string? Email { get; set; }
}