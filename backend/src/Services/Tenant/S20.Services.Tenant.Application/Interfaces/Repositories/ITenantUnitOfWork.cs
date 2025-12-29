using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Interfaces.Repositories
{
    public interface ITenantUnitOfWork
    {
        ITenantRepository Tenants { get; }
        ITenantUserRepository TenantUsers { get; }
        Task<int> CompleteAsync();
    }
}
