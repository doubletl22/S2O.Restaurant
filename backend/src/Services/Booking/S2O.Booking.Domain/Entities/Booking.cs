using S2O.Shared.Kernel.Primitives;

namespace S2O.Booking.Domain.Entities;

public class Booking : Entity, IAuditableEntity, IMustHaveTenant
{
    public new Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public Guid BranchId { get; set; } // BỔ SUNG: Đặt bàn phải theo chi nhánh
    public Guid? TableId { get; set; } // BỔ SUNG: Có thể gán bàn trước hoặc không

    public string GuestName { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!;
    public DateTime BookingTime { get; set; }
    public int PartySize { get; set; }
    public string? Note { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public string? CreatedBy { get; set; }
    public string? LastModifiedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }

    // Logic thay đổi trạng thái
    public void Confirm()
    {
        if (Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Không thể duyệt đơn đã hủy.");
        Status = BookingStatus.Confirmed;
    }
    public void Cancel() => Status = BookingStatus.Cancelled;
    public void CheckIn() => Status = BookingStatus.Completed;
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed // Khách đã đến
}