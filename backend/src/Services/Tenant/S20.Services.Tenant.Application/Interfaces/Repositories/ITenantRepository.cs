using S20.Share.Libary.Interfaces;
using S2O.Services.Tenants.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Interfaces.Repositories
{
    public interface ITenantRepository : IBaseRepository<Tenant>
    {
        Task<Tenant?> GetByCodeAsync(string code);
        Task<bool> ExistsByCodeAsync(string code);
    }
}
