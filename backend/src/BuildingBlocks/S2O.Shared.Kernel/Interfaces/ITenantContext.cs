namespace S2O.Shared.Kernel.Interfaces;

public interface ITenantContext
{
    Guid? TenantId { get; set; }
    Guid? BranchId { get; set; }
    string? Email { get; set; }
}