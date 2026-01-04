using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Ordering.Domain.Entities
{
    public class OrderItem : IEntity
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }

        // Lưu Snapshot dữ liệu món ăn (để nếu giá gốc đổi thì đơn cũ không bị sai)
        public Guid MenuId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }

        public Order Order { get; set; } = null!; // Navigation Prop

        // IEntity Implementation
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}