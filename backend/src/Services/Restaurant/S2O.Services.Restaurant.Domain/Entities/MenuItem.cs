using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Restaurant.Domain.Entities
{
    public class MenuItem : IEntity
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; } // Thuộc về nhà hàng nào

        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;

        public string Category { get; set; } = "General"; // Ví dụ: Đồ uống, Khai vị

        // Audit props
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}