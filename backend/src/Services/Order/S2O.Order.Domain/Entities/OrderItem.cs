namespace S2O.Order.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; } // ID món ăn từ Catalog Service
    public string ProductName { get; set; } = string.Empty; // Lưu tên món tại thời điểm đặt (tránh đổi tên menu làm sai lệch hóa đơn cũ)
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
}