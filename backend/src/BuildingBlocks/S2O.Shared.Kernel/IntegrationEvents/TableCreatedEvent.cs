using MediatR;

namespace S2O.Shared.Kernel.IntegrationEvents;

public record TableCreatedEvent(
    Guid TableId,
    Guid TenantId,
    Guid BranchId,
    string Name,
    string? QrCodeUrl,
    int Capacity
) : INotification;