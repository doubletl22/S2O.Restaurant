using S2O.Services.Restaurant.Application.DTOs;
using S2O.Services.Restaurant.Application.Interfaces; // Dùng Interface
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Restaurant.Application.Services
{
    public class AdminTenantService
    {
        private readonly IRestaurantRepository _repository; // Thay đổi ở đây

        public AdminTenantService(IRestaurantRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<List<RestaurantResponse>>> GetAllTenantsAsync()
        {
            var restaurants = await _repository.GetAllAsync();

            var response = restaurants.Select(r => new RestaurantResponse
            {
                Id = r.Id,
                Name = r.Name,
                Address = r.Address,
                IsActive = r.IsActive
            }).ToList();

            return Result.Success(response);
        }
    }
}