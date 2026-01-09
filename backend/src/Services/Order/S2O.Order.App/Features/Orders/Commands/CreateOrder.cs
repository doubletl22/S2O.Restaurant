using MediatR;
using S2O.Shared.Kernel.Results;
// Alias để tránh xung đột tên
using OrderEntity = S2O.Order.Domain.Entities.Order;

namespace S2O.Order.App.Features.Orders.Commands.CreateOrder;

public record CreateOrderCommand(
    string CustomerName,
    int TableNumber,
    List<OrderItemRequest> Items
) : IRequest<Result<Guid>>;

public record OrderItemRequest(Guid ProductId, int Quantity, decimal Price);