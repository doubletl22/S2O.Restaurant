using S2O.Shared.Kernel.Primitives;

namespace S2O.Booking.Domain.Entities;

public class Booking : Entity, IAuditableEntity, IMustHaveTenant
{
    public new Guid Id { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime BookingTime { get; set; } // Giờ khách hứa đến
    public int PartySize { get; set; }        // Số lượng người
    public string? Note { get; set; }         // Ghi chú (VD: Cần ghế trẻ em)
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? Reason { get; set; }       // Lý do từ chối/hủy (nếu có)
    public Guid? TenantId { get; set; }    
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
    public string? LastModifiedBy { get; set; }
}

public enum BookingStatus
{
    Pending,    // Mới tạo, chờ nhà hàng xác nhận
    Confirmed,  // Nhà hàng đã đồng ý (Giữ bàn)
    Rejected,   // Nhà hàng từ chối (Full bàn)
    Cancelled,  // Khách hủy
    Completed,  // Khách đã đến ăn xong
    NoShow      // Khách đặt nhưng không đến
}