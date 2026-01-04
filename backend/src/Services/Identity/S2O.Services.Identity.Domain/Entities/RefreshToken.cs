using S2O.Shared.Kernel.Primitives;
using System.ComponentModel.DataAnnotations.Schema; // Thêm dòng này

namespace S2O.Services.Identity.Domain.Entities
{
    public class RefreshToken : IEntity
    {
        public Guid Id { get; set; }
        public string Token { get; set; } = string.Empty;

        // --- SỬA Ở ĐÂY: Đổi string thành Guid ---
        public Guid UserId { get; set; }

        // Thêm Navigation Property để EF hiểu rõ mối quan hệ (Optional nhưng nên làm)
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiryDate;

        DateTime? IEntity.CreatedAt { get => CreatedAt; set => CreatedAt = value ?? DateTime.UtcNow; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}