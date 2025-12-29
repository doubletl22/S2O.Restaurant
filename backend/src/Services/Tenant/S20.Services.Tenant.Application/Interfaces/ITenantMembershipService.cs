using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Interfaces
{
    public interface ITenantMembershipService
    {
        Task AddAddUserToTenantAsync(Guid tenantId, Guid userId, Guid roleId);
        Task RemoveUserFromTenantAsync(Guid tenantId, Guid userId);
    }
}
