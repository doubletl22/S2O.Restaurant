using S2O.Services.Restaurant.Domain.Entities;

namespace S2O.Services.Restaurant.Application.Interfaces
{
    public interface IRestaurantRepository
    {
        // Cho Owner
        Task<bool> HasRestaurantAsync(Guid ownerId);
        Task<Domain.Entities.Restaurant?> GetByOwnerIdAsync(Guid ownerId);
        Task AddAsync(Domain.Entities.Restaurant restaurant);

        // Cho Admin
        Task<List<Domain.Entities.Restaurant>> GetAllAsync();

        // Chung
        Task SaveChangesAsync();
    }
}