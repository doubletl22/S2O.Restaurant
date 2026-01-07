using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface ITenantRepository
    {
        Task<Tenant?> GetByCodeAsync(string tenantCode); 
        Task<Tenant?> GetByIdAsync(Guid tenantId); 
        Task<bool> ExistsAsync(string tenantCode);
    }
}
