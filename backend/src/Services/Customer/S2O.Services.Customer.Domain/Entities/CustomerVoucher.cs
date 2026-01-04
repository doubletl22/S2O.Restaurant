using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Customer.Domain.Entities
{
    public class CustomerVoucher : IEntity
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }

        public string Code { get; set; } = default!; // Mã voucher (VD: GIAM50K)
        public string Description { get; set; } = default!;
        public decimal DiscountAmount { get; set; } // Giảm bao nhiêu tiền
        public bool IsUsed { get; set; } = false;
        public DateTime ExpiryDate { get; set; }

        public Customer Customer { get; set; } = null!;

        // IEntity props
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}