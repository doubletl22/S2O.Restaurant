using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.IntegrationEvents;

namespace S2O.Order.App.Features.Orders.EventHandlers;

public class PaymentSucceededEventHandler : INotificationHandler<PaymentSucceededEvent>
{
    private readonly IOrderDbContext _context;
    private readonly ITenantClient _tenantClient;

    public PaymentSucceededEventHandler(IOrderDbContext context, ITenantClient tenantClient)
    {
        _context = context;
        _tenantClient = tenantClient;
    }

    public async Task Handle(PaymentSucceededEvent notification, CancellationToken cancellationToken)
    {
        // 1. Tìm Order
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == notification.OrderId, cancellationToken);

        if (order == null) return; // Hoặc log warning

        // 2. Cập nhật trạng thái Order
        // Giả sử Order có hàm xác nhận thanh toán
        order.Status = OrderStatus.Paid;

        // Hoặc nếu bạn quản lý PaymentStatus riêng:
        // order.PaymentStatus = PaymentStatus.Paid;

        // 3. Lưu thay đổi
        await _context.SaveChangesAsync(cancellationToken);

        if (order.TableId.HasValue)
        {
            await _tenantClient.UpdateTableOccupancyAsync(order.TableId.Value, false, cancellationToken);
        }
    }
}