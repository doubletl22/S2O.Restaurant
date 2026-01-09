using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public record OrderItemRequest(Guid ProductId, int Quantity);

public record PlaceOrderCommand(
    Guid TableId,
    List<OrderItemRequest> Items
) : IRequest<Result<Guid>>;