namespace S2O.Services.Ordering.Domain.Enums
{
    public enum OrderStatus
    {
        Pending = 0,    // Mới đặt, chờ xác nhận
        Confirmed = 1,  // Bếp đã nhận
        Kitchen = 2,    // Đang nấu
        Served = 3,     // Đã mang ra bàn
        Paid = 4,       // Đã thanh toán
        Cancelled = 5   // Đã hủy
    }
}