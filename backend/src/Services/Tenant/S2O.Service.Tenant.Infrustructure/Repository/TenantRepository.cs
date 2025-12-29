using Microsoft.EntityFrameworkCore;
using S20.Services.Tenants.Application.Interfaces.Repositories;
using S20.Share.Libary.Infrastructure;
using S2O.Services.Tenants.Domain.Entities;
using S2O.Services.Tenants.Infrastructure.Data;

namespace S2O.Services.Tenants.Infrastructure.Repository
{
    public class TenantRepository : BaseRepository<Tenant, TenantDbContext>, ITenantRepository
    {

        public TenantRepository(TenantDbContext context) : base(context)
        {
        }

        public async Task<bool> ExistsByCodeAsync(string code)
        {
            return await _context.Tenants.AnyAsync(t => t.Code == code);
        }

        public async Task<Tenant?> GetByCodeAsync(string code)
        {
            return await _context.Tenants.FirstOrDefaultAsync(t => t.Code == code);
        }
    }
}
