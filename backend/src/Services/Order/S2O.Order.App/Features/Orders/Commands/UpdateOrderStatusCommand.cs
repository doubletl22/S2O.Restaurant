using MediatR;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public record UpdateOrderStatusCommand(
    Guid OrderId,
    OrderStatus NewStatus,
    Guid CurrentBranchId // Để bảo mật: Nhân viên Branch A không được sửa đơn Branch B
) : IRequest<Result>;