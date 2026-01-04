using S2O.Services.Ordering.Domain.Entities;

namespace S2O.Services.Ordering.Application.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order?> GetByIdAsync(Guid id);
        Task AddAsync(Order order);
        Task UpdateAsync(Order order);
        // Lấy danh sách đơn của 1 nhà hàng
        Task<List<Order>> GetByRestaurantAsync(Guid restaurantId);
    }
}