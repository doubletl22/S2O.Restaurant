using S2O.Services.Restaurant.Application.DTOs;
using S2O.Services.Restaurant.Application.Interfaces; // Dùng Interface thay vì DBContext
using S2O.Services.Restaurant.Domain.Entities;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Restaurant.Application.Services
{
    public interface IMenuService
    {
        Task<Result<Guid>> CreateCategoryAsync(CreateCategoryRequest request);
        Task<Result<Guid>> CreateDishAsync(CreateDishRequest request);
        Task<Result<List<MenuDto>>> GetMenuAsync(Guid restaurantId);
    }

    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _menuRepository; // Inject Repository

        public MenuService(IMenuRepository menuRepository)
        {
            _menuRepository = menuRepository;
        }

        public async Task<Result<Guid>> CreateCategoryAsync(CreateCategoryRequest request)
        {
            var category = new Category(request.RestaurantId, request.Name);
            await _menuRepository.AddCategoryAsync(category);
            await _menuRepository.SaveChangesAsync();
            return Result.Success(category.Id);
        }

        public async Task<Result<Guid>> CreateDishAsync(CreateDishRequest request)
        {
            var category = await _menuRepository.GetCategoryByIdAsync(request.CategoryId);

            // Validate
            if (category == null || category.RestaurantId != request.RestaurantId)
                return Result.Failure<Guid>("Danh mục không tồn tại hoặc không thuộc nhà hàng này.");

            var dish = Dish.Create(request.RestaurantId, request.CategoryId, request.Name, request.Price, request.Description, request.ImageUrl);

            await _menuRepository.AddDishAsync(dish);
            await _menuRepository.SaveChangesAsync();

            return Result.Success(dish.Id);
        }

        public async Task<Result<List<MenuDto>>> GetMenuAsync(Guid restaurantId)
        {
            var categories = await _menuRepository.GetCategoriesByRestaurantIdAsync(restaurantId);

            var menu = categories.Select(c => new MenuDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                Dishes = c.Dishes.Select(d => new DishDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Price = d.Price,
                    Description = d.Description,
                    ImageUrl = d.ImageUrl,
                    IsAvailable = d.IsAvailable
                }).ToList()
            }).ToList();

            return Result.Success(menu);
        }
    }
}