using S2O.Order.Domain.Enums;

namespace S2O.Order.App.DTOs;

public class GuestOrderTrackingItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Note { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public OrderStatus Status { get; set; } // lấy theo status của Order
}

public class GuestOrderTrackingDto
{
    public List<GuestOrderTrackingItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
}
