namespace S2O.Shared.Kernel.Primitives;

public interface IMustHaveTenant
{
    Guid? TenantId { get; set; }
}