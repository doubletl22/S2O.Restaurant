using S2O.Shared.Kernel.Primitives;

namespace S2O.Order.Domain.Entities;

public class Order : IAuditableEntity, IMustHaveTenant
{
    public Guid Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int TableNumber { get; set; }
    public string OrderNumber { get; set; } = string.Empty; // Mã đơn hàng (VD: S2O-2026-001)
    public Guid TableId { get; set; } // Đơn hàng thuộc bàn nào
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    // Multi-tenant & Audit
    public Guid? TenantId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
    public string? LastModifiedBy { get; set; }
}

public enum OrderStatus
{
    Pending,    // Chờ xử lý
    Preparing,  // Đang chế biến (Bếp nhận)
    Ready,      // Đã xong món
    Delivered,  // Đã phục vụ
    Completed,  // Đã thanh toán
    Cancelled   // Đã hủy
}