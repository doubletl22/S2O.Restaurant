using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email); 
        Task<User> AddAsync(User user); 
        Task<User> GetByIdAsync(Guid id); 
        Task<bool> ExistsAsync(Guid userId, Guid tenantId);
        Task<IEnumerable<User>> GetByTenantIdAsync(Guid tenantId);
        Task UpdateAsync(User user);
        Task<bool> ExistsByEmailAsync(string email);
    }
}
