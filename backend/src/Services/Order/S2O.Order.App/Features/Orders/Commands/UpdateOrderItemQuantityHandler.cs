using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class UpdateOrderItemQuantityHandler : IRequestHandler<UpdateOrderItemQuantityCommand, Result>
{
    private readonly IOrderDbContext _context;

    public UpdateOrderItemQuantityHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateOrderItemQuantityCommand request, CancellationToken cancellationToken)
    {
        if (request.NewQuantity < 0)
        {
            return Result.Failure(new Error("Order.InvalidQuantity", "Số lượng không hợp lệ."));
        }

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(
                o => o.Id == request.OrderId && o.BranchId == request.CurrentBranchId,
                cancellationToken
            );

        if (order == null)
        {
            return Result.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng này."));
        }

        if (order.Status == OrderStatus.Paid || order.Status == OrderStatus.Cancelled)
        {
            return Result.Failure(new Error("Order.Closed", "Đơn hàng đã đóng, không thể chỉnh sửa."));
        }

        var item = order.Items.FirstOrDefault(i => i.Id == request.OrderItemId);
        if (item == null)
        {
            return Result.Failure(new Error("Order.ItemNotFound", "Không tìm thấy món cần chỉnh sửa."));
        }

        if (request.NewQuantity == 0)
        {
            _context.OrderItems.Remove(item);
            order.Items.Remove(item);
        }
        else
        {
            item.Quantity = request.NewQuantity;
            item.TotalPrice = item.UnitPrice * item.Quantity;
        }

        order.TotalAmount = order.Items.Sum(i => i.TotalPrice);

        if (!order.Items.Any())
        {
            order.Status = OrderStatus.Cancelled;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
