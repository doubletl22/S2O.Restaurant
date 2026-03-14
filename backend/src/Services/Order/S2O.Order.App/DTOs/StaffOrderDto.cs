using S2O.Order.Domain.Enums;

namespace S2O.Order.App.DTOs;

public class StaffOrderDto
{
    public Guid Id { get; set; }
    public string TableId { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty; // ✅ Add TableName
    public string OrderNumber { get; set; } = string.Empty; // ✅ Add OrderNumber
    public string Note { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedAt { get; set; } = string.Empty; // ✅ Backward compat
    public string CreatedOn { get; set; } = string.Empty; // ✅ Backward compat

    // Danh sách món trong đơn
    public List<StaffOrderItemDto> Items { get; set; } = new();
}

public class StaffOrderItemDto
{
    public string Id { get; set; } = string.Empty; // ✅ Add item Id
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty; // ✅ Add ProductName
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; } // ✅ Add Note
    public OrderStatus Status { get; set; } // ✅ Add item Status
}