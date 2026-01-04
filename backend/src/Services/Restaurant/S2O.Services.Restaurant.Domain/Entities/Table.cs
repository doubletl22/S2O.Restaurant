using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Restaurant.Domain.Entities
{
    public class Table : IEntity
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }

        public string TableName { get; set; } = default!; // Ví dụ: "Bàn 1", "VIP 2"
        public int Capacity { get; set; } // Số ghế
        public bool IsOccupied { get; set; } = false; // Trạng thái có khách

        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}