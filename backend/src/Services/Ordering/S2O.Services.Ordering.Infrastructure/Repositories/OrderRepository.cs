using Microsoft.EntityFrameworkCore;
using S2O.Services.Ordering.Application.Interfaces;
using S2O.Services.Ordering.Domain.Entities;
using S2O.Services.Ordering.Infrastructure.Data;

namespace S2O.Services.Ordering.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly OrderingDbContext _context;

        public OrderRepository(OrderingDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
        }

        public async Task<Order?> GetByIdAsync(Guid id)
        {
            return await _context.Orders
                .Include(o => o.Items) // Quan trọng: Load kèm Items
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task UpdateAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Order>> GetByRestaurantAsync(Guid restaurantId)
        {
            return await _context.Orders
               .Include(o => o.Items)
               .Where(o => o.RestaurantId == restaurantId)
               .OrderByDescending(o => o.CreatedAt)
               .ToListAsync();
        }
    }
}