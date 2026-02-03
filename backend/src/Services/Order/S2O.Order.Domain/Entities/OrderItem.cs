using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Primitives;
namespace S2O.Order.Domain.Entities;

public class OrderItem : Entity, IMustHaveTenant
{
    public new Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Note { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public Order Order { get; set; } = null!;
    public Guid? TenantId { get; set; }
}