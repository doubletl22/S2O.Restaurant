using S2O.Services.Restaurant.Domain.Entities;

namespace S2O.Services.Restaurant.Application.Interfaces
{
    public interface IMenuRepository
    {
        // Category
        Task AddCategoryAsync(Category category);
        Task<Category?> GetCategoryByIdAsync(Guid id);
        Task<List<Category>> GetCategoriesByRestaurantIdAsync(Guid restaurantId);

        // Dish
        Task AddDishAsync(Dish dish);

        // Save Changes
        Task SaveChangesAsync();
    }
}