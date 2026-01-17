using S2O.Order.Domain.Enums;

namespace S2O.Order.App.DTOs;

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public string StatusName => Status.ToString(); // Trả về tên trạng thái cho dễ đọc
    public int ItemCount { get; set; }
}