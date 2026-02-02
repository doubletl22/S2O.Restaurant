using MediatR;

namespace S2O.Shared.Kernel.IntegrationEvents;

public record PaymentSucceededEvent(
    Guid OrderId,
    decimal Amount,
    string PaymentMethod,
    DateTime PaidAt
) : INotification;