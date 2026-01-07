using S20.Share.Libary.Interfaces;
using S2O.Services.Tenants.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Interfaces.Repositories
{
    public interface ITenantUserRepository  : IBaseRepository<TenantUser>
    {
        Task<IEnumerable<TenantUser>> GetByUserIdAsync(Guid userId);
        Task<TenantUser?> GetUserInTenantAsync(Guid userId, Guid tenantId);
    }
}
