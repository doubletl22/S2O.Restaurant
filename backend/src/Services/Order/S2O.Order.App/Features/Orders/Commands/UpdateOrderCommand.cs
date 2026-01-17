using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

// Dùng lại GuestOrderItemDto đã tạo ở bài trước
public record UpdateOrderCommand(
    Guid OrderId,
    List<GuestOrderItemDto> NewItems,
    string? NewNote
) : IRequest<Result>;