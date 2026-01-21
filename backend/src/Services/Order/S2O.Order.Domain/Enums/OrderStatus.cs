namespace S2O.Order.Domain.Enums;

public enum OrderStatus
{
    Pending = 0,    // Chờ xác nhận
    Confirmed = 1,  // Bếp đã nhận
    Cooking = 2,    // Đang nấu
    Ready = 3,      // Đã xong, chờ bưng
    Completed = 4,  // Đã thanh toán/hoàn tất
    Cancelled = 5,   // Đã hủy
    Paid = 6         // Đã thanh toán
}