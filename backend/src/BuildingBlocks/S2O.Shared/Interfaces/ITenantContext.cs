namespace S2O.Shared.Interfaces;

public interface ITenantContext
{
    Guid? TenantId { get; set; }
    string? Email { get; set; }
}