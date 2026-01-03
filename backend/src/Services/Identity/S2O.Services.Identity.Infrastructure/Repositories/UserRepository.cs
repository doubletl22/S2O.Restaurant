using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using S2O.Services.Identity.Infrastructure.Data;

namespace S2O.Services.Identity.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(User user)
        {
            // Thêm vào DbSet<User> (AppUsers) thay vì dùng UserManager
            await _context.AppUsers.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            // Truy vấn trực tiếp từ DB
            return await _context.AppUsers
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.AppUsers
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        // Nếu Interface có method Update thì thêm vào:
        // public async Task UpdateAsync(User user)
        // {
        //     _context.AppUsers.Update(user);
        //     await _context.SaveChangesAsync();
        // }
    }
}