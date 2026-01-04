using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Customer.Domain.Entities
{
    public class CustomerFavorite : IEntity
    {
        public Guid CustomerId { get; set; }
        public Guid RestaurantId { get; set; }

        // --- SỬA Ở ĐÂY: Thêm dấu ? vào sau DateTime ---
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Customer Customer { get; set; } = null!;

        // Implement các trường còn lại của IEntity
        public DateTime? LastModified { get; set; }
        public string? CreatedBy { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}