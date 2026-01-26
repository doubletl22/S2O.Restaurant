namespace S2O.Shared.Kernel.IntegrationEvents;

public record TenantCreatedEvent(
    Guid TenantId,
    Guid DefaultBranchId,
    string RestaurantName,
    string Address,
    string Phone);