using MediatR;

namespace S2O.Shared.Kernel.IntegrationEvents;

// Sự kiện này sẽ được bắn ra khi thanh toán thành công
public record PaymentSucceededEvent(
    Guid OrderId,
    decimal Amount,
    string PaymentMethod,
    DateTime PaidAt
) : INotification;