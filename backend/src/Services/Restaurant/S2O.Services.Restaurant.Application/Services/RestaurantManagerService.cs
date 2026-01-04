using S2O.Services.Restaurant.Application.DTOs;
using S2O.Services.Restaurant.Application.Interfaces; // Dùng Interface
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Restaurant.Application.Services
{
    public class RestaurantManagerService
    {
        private readonly IRestaurantRepository _repository; // Thay đổi ở đây

        public RestaurantManagerService(IRestaurantRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<RestaurantResponse>> RegisterRestaurantAsync(Guid ownerId, CreateRestaurantRequest request)
        {
            // Logic: Kiểm tra qua Repository
            var hasRestaurant = await _repository.HasRestaurantAsync(ownerId);
            if (hasRestaurant) return Result.Failure<RestaurantResponse>("User already owns a restaurant.");

            var restaurant = Domain.Entities.Restaurant.Create(ownerId, request.Name, request.Address, request.PhoneNumber);

            await _repository.AddAsync(restaurant);
            await _repository.SaveChangesAsync();

            return Result.Success(new RestaurantResponse
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Address = restaurant.Address,
                IsActive = restaurant.IsActive
            });
        }

        public async Task<Result<RestaurantResponse>> GetMyRestaurantAsync(Guid ownerId)
        {
            var restaurant = await _repository.GetByOwnerIdAsync(ownerId);
            if (restaurant == null) return Result.Failure<RestaurantResponse>("No restaurant found for this user.");

            return Result.Success(new RestaurantResponse
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Address = restaurant.Address,
                IsActive = restaurant.IsActive
            });
        }
    }
}