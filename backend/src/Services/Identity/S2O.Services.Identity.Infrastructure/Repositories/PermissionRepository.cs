using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Infrastructure.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly ApplicationDbContext context;

        public PermissionRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<IList<string>> GetPermissionsByRolesIdAsync(IList<Guid> rolesId)
        {
            return await context.RolePermissions
                .Where(rp => rolesId.Contains(rp.RoleId))
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();
        }
    }
}
