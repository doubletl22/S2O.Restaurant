using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

// Input: ID đơn hàng và Lý do hủy
public record CancelOrderCommand(Guid OrderId, string Reason) : IRequest<Result>;