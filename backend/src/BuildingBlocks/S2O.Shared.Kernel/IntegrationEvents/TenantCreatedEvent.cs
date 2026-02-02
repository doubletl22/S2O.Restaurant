namespace S2O.Shared.Kernel.IntegrationEvents;

public record TenantCreatedEvent(
    Guid TenantId,
    Guid DefaultBranchId,
    string RestaurantName,
    string Address,
    string Phone)
{
    public TenantCreatedEvent() : this(Guid.Empty, Guid.Empty, string.Empty, string.Empty, string.Empty)
    {
    }
}