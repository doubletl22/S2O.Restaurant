using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Ordering.Domain.Entities
{
    public class OrderItem : IEntity
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid MenuId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }

        // --- BỔ SUNG: Ghi chú cho từng món ---
        public string? Note { get; set; }

        // Tính tiền dòng này (không lưu DB, chỉ tính toán)
        public decimal TotalLineAmount => UnitPrice * Quantity;

        public Order Order { get; set; } = null!;

        public OrderItem() { }

        // Constructor đầy đủ
        public OrderItem(Guid orderId, Guid menuId, string productName, decimal price, int quantity, string? note)
        {
            Id = Guid.NewGuid();
            OrderId = orderId;
            MenuId = menuId;
            ProductName = productName;
            UnitPrice = price;
            Quantity = quantity;
            Note = note;
        }

        public void AddQuantity(int quantity)
        {
            Quantity += quantity;
        }

        // IEntity props
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}