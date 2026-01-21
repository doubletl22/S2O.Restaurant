namespace S2O.Booking.App.Abstractions;

public interface ITenantTableChecker
{
    // Hàm này trả về Capacity của bàn nếu tìm thấy, trả về null nếu không thấy
    Task<int?> GetTableCapacityAsync(Guid tableId, Guid branchId);
}