using S2O.Order.Domain.Enums;

namespace S2O.Order.App.DTOs;

public class StaffOrderDto
{
    public Guid Id { get; set; }
    public string TableId { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime CreatedAtUtc { get; set; }

    // Danh sách món trong đơn
    public List<StaffOrderItemDto> Items { get; set; } = new();
}

public class StaffOrderItemDto
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}