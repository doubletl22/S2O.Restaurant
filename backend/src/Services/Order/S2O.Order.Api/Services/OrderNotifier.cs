using Microsoft.AspNetCore.SignalR;
using S2O.Order.Api.Hubs;
using S2O.Order.App.Abstractions;

namespace S2O.Order.Api.Services;

public class OrderNotifier : IOrderNotifier
{
    private readonly IHubContext<OrderHub> _hubContext;

    public OrderNotifier(IHubContext<OrderHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyNewOrderAsync(Guid branchId, Guid orderId)
    {
        // Gửi tin nhắn đến Group tương ứng với BranchId
        // Sự kiện tên là "NewOrderCreated"
        await _hubContext.Clients.Group(branchId.ToString())
            .SendAsync("NewOrderCreated", new { OrderId = orderId, Message = "Có đơn hàng mới!" });
    }

    public async Task NotifyOrderStatusChangedAsync(Guid branchId, Guid orderId, string newStatus)
    {
        // Sự kiện tên là "OrderStatusUpdated"
        await _hubContext.Clients.Group(branchId.ToString())
            .SendAsync("OrderStatusUpdated", new { OrderId = orderId, Status = newStatus });
    }
}