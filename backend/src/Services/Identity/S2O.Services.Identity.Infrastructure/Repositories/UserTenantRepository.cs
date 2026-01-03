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
    public class UserTenantRepository : IUserTenantRepository
    {
        private readonly AppIdentityDbContext _context;

        public UserTenantRepository(AppIdentityDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(UserTenant userTenant)
        {
            _context.UserTenants.Add(userTenant);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsInTenantAsync(Guid userId, Guid tenantId)
        {
            return await _context.UserTenants
              .AsNoTracking()
              .AnyAsync(ut => ut.UserId == userId  && ut.TenantId == tenantId);
        }

        public async Task<List<Guid>> GetTenantIdsForUser(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.UserTenants
                .AsNoTracking()
                .Where(ut => ut.UserId == userId)
                .Select(ut => ut.TenantId)
                .ToListAsync();
        }
    }
}
