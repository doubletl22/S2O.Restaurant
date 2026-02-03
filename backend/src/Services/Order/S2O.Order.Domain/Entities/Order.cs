using S2O.Shared.Kernel.Primitives;
using S2O.Order.Domain.Enums;

namespace S2O.Order.Domain.Entities;

public class Order : Entity, IAuditableEntity, IMustHaveTenant
{
    public Guid? UserId { get; set; }
    public Guid BranchId { get; set; }
    public Guid? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public Guid? TableId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string? Note { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Guid? TenantId { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
    public string? LastModifiedBy { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime CreatedON { get; set; }
    }

