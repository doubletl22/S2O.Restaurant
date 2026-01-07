using Microsoft.EntityFrameworkCore;
using S20.Services.Tenants.Application.Interfaces.Repositories;
using S20.Share.Libary.Infrastructure;
using S2O.Services.Tenants.Domain.Entities;
using S2O.Services.Tenants.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Tenants.Infrastructure.Repository
{
    public class TenantUserRepository : BaseRepository<TenantUser, TenantDbContext>, ITenantUserRepository
    {
        public TenantUserRepository(TenantDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<TenantUser>> GetByUserIdAsync(Guid userId)
        {
            return await _context.TenantUsers
        .Where(x => x.UserId.Equals(userId))
        .ToListAsync();
        }

        public async Task<TenantUser?> GetUserInTenantAsync(Guid userId, Guid tenantId)
        {
            return await _context.TenantUsers
                .FirstOrDefaultAsync(x => x.UserId == userId && x.TenantId == tenantId);
        }
    }
}
