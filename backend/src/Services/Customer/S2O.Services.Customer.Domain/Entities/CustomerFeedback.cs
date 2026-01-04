using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Customer.Domain.Entities
{
    public class CustomerFeedback : IEntity
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid RestaurantId { get; set; } // Đánh giá quán nào

        public int Rating { get; set; } // 1 đến 5 sao
        public string? Comment { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Customer Customer { get; set; } = null!;

        // IEntity props
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}