using S2O.Shared.Kernel.Primitives;

namespace S2O.Payment.Domain.Entities;

public class PaymentTransaction : Entity, IAuditableEntity, IMustHaveTenant
{
    public new Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ExternalTransactionId { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? FailureReason { get; set; }
    public Guid? TenantId { get; set; }    
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
    public string? LastModifiedBy { get; set; }
}

public enum PaymentStatus
{
    Pending, 
    Success, 
    Failed, 
    Refunded
}