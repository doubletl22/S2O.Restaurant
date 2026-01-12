using MediatR;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Payment.App.Features.Payments.Commands;

public record CreatePaymentCommand(
    Guid OrderId,
    decimal Amount,
    string PaymentMethod // "Cash", "VNPay", "Momo"
) : ICommand<Guid>;