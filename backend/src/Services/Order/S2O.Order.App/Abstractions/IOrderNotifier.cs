namespace S2O.Order.App.Abstractions;

public interface IOrderNotifier
{
    // Thông báo cho Bếp: Có đơn mới
    Task NotifyNewOrderAsync(Guid branchId, Guid orderId);

    // Thông báo cho Phục vụ/Thu ngân: Món đã xong/Đã hủy
    Task NotifyOrderStatusChangedAsync(Guid branchId, Guid orderId, string newStatus);
}