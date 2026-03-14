using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public record UpdateOrderItemQuantityCommand(
    Guid OrderId,
    Guid OrderItemId,
    int NewQuantity,
    Guid CurrentBranchId
) : IRequest<Result>;
