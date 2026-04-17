using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;
using OrderEntity = S2O.Order.Domain.Entities.Order; // Alias

namespace S2O.Order.App.Features.Orders.Commands;

public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusCommand, Result>
{
    private readonly IOrderDbContext _context;
    private readonly IOrderNotifier _notifier;
    private readonly ITenantClient _tenantClient;

    public UpdateOrderStatusHandler(IOrderDbContext context, IOrderNotifier notifier, ITenantClient tenantClient)
    {
        _context = context;
        _notifier = notifier;
        _tenantClient = tenantClient;
    }

    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null) return Result.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng"));

        // SECURITY CHECK: Đảm bảo nhân viên đang làm việc đúng chi nhánh của đơn hàng
        if (order.BranchId != request.CurrentBranchId)
        {
            return Result.Failure(new Error("Security.InvalidBranch", "Bạn không có quyền xử lý đơn hàng của chi nhánh khác."));
        }

        // Cập nhật trạng thái
        order.Status = request.NewStatus;

        // (Có thể thêm logic log lịch sử: Ai đã đổi trạng thái vào giờ nào)

        await _context.SaveChangesAsync(cancellationToken);

        if (order.TableId.HasValue)
        {
            var occupiedState = MapOccupiedState(order.Status);
            if (occupiedState.HasValue)
            {
                await _tenantClient.UpdateTableOccupancyAsync(order.TableId.Value, occupiedState.Value, cancellationToken);
            }
        }

        await _notifier.NotifyOrderStatusChangedAsync(
            order.BranchId,
            order.Id,
            order.Status.ToString()
        );
        return Result.Success();
    }

    private static bool? MapOccupiedState(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Confirmed => true,
            OrderStatus.Cooking => true,
            OrderStatus.Ready => true,
            OrderStatus.Paid => false,
            OrderStatus.Completed => false,
            OrderStatus.Cancelled => false,
            _ => null
        };
    }
}