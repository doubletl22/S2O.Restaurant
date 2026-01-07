using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IUserTenantRepository
    {
        Task AddAsync(UserTenant userTenant); 
        Task<List<Guid>> GetTenantIdsForUser(Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsInTenantAsync(Guid userId, Guid tenantId);
    }
}
