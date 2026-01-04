using Microsoft.EntityFrameworkCore;
using S2O.Services.Restaurant.Application.Interfaces;
using S2O.Services.Restaurant.Infrastructure.Data;

namespace S2O.Services.Restaurant.Infrastructure.Repositories
{
    public class RestaurantRepository : IRestaurantRepository
    {
        private readonly RestaurantDbContext _context;

        public RestaurantRepository(RestaurantDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Domain.Entities.Restaurant restaurant)
        {
            await _context.Restaurants.AddAsync(restaurant);
        }

        public async Task<List<Domain.Entities.Restaurant>> GetAllAsync()
        {
            return await _context.Restaurants.ToListAsync();
        }

        public async Task<Domain.Entities.Restaurant?> GetByOwnerIdAsync(Guid ownerId)
        {
            return await _context.Restaurants.FirstOrDefaultAsync(x => x.OwnerIdentityId == ownerId);
        }

        public async Task<bool> HasRestaurantAsync(Guid ownerId)
        {
            return await _context.Restaurants.AnyAsync(x => x.OwnerIdentityId == ownerId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}