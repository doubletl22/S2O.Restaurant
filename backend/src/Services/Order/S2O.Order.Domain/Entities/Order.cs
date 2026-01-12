using S2O.Shared.Kernel.Primitives;

namespace S2O.Order.Domain.Entities;

public class Order : Entity, IAuditableEntity, IMustHaveTenant
{
    public new Guid Id { get; set; }
    public Guid? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public Guid? TableId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string? Note { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Guid? TenantId { get; set; }
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