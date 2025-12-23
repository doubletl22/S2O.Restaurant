using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IRoleRepository
    {
        //Task<Role> GetById(int id);
        //Task<Role> GetByName(string name);
        Task<Role?> GetRoleByIdAsync(Guid id);
        Task<Role?> GetRoleByNameAsync(string name);
        Task<IEnumerable<Role>> GetAllRolesAsync();
    }
}
