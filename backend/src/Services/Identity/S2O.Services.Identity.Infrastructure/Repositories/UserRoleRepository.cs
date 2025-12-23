using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using S2O.Services.Identity.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Infrastructure.Repositories
{
    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly ApplicationDbContext context;

        public UserRoleRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task AddAsync(UserRole userRole)
        {
            context.UserRoles.Add(userRole);
            await context.SaveChangesAsync();
        }

        public async Task<IList<Role>> GetRolesAsync(Guid userId, Guid? tenantId)
        {
            return await context.UserRoles
                .Where(ur => ur.UserId == userId && ur.TenantId == tenantId)
                .Include(ur => ur.Role)
                .Select(ur => ur.Role)
                .ToListAsync();
        }
    }
}
