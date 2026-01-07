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
    public class TenantRepository : ITenantRepository
    {
        private readonly AppIdentityDbContext _db;

        public TenantRepository(AppIdentityDbContext db)
        {
            _db = db;
        }

        public async Task<bool> ExistsAsync(string tenantCode)
        {
            return await _db.Tenants.AnyAsync(t => t.Code == tenantCode);
        }

        public async Task<Tenant?> GetByCodeAsync(string tenantCode)
        {
            return await _db.Tenants.FirstOrDefaultAsync(t => t.Code == tenantCode);
        }

        public async Task<Tenant?> GetByIdAsync(Guid tenantId)
        {
            return await _db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
        }
    }
}
