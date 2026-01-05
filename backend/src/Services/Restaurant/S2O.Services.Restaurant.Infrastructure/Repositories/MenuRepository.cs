using Microsoft.EntityFrameworkCore;
using S2O.Services.Restaurant.Application.Interfaces;
using S2O.Services.Restaurant.Domain.Entities;
using S2O.Services.Restaurant.Infrastructure.Data;

namespace S2O.Services.Restaurant.Infrastructure.Repositories
{
    public class MenuRepository : IMenuRepository
    {
        private readonly RestaurantDbContext _context;

        public MenuRepository(RestaurantDbContext context)
        {
            _context = context;
        }

        public async Task AddCategoryAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
        }

        public async Task<Category?> GetCategoryByIdAsync(Guid id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<List<Category>> GetCategoriesByRestaurantIdAsync(Guid restaurantId)
        {
            return await _context.Categories
                .Where(c => c.RestaurantId == restaurantId)
                .Include(c => c.Dishes) // Load kèm món ăn
                .ToListAsync();
        }

        public async Task AddDishAsync(Dish dish)
        {
            await _context.Dishes.AddAsync(dish);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}