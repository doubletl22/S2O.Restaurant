using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class CancelOrderHandler : IRequestHandler<CancelOrderCommand, Result>
{
    private readonly IOrderDbContext _context;

    public CancelOrderHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm đơn hàng
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
        {
            return Result.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng."));
        }

        // 2. Validate: Chỉ được hủy khi đang Pending
        if (order.Status != OrderStatus.Pending)
        {
            return Result.Failure(new Error("Order.CannotCancel", "Đơn hàng đã được Bếp tiếp nhận, không thể hủy."));
        }

        // 3. Cập nhật trạng thái
        order.Status = OrderStatus.Cancelled;
        order.Note += $" | Lý do hủy: {request.Reason}"; // Ghi chú thêm lý do
        // order.LastModifiedAtUtc = DateTime.UtcNow; // (Entity thường tự xử lý cái này)

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}