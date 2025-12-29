using Microsoft.EntityFrameworkCore;
using S20.Services.Tenants.Application.Interfaces.Repositories;
using S2O.Services.Tenants.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Tenants.Infrastructure.Repository
{
    public class TenantUnitOfWork : ITenantUnitOfWork
    {
        private readonly TenantDbContext _context;

        public ITenantRepository Tenants {  get;  }

        public ITenantUserRepository TenantUsers { get; }

        public TenantUnitOfWork(TenantDbContext context)
        {
            _context = context;
            Tenants = new TenantRepository(_context);
            TenantUsers = new TenantUserRepository(_context);

        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
