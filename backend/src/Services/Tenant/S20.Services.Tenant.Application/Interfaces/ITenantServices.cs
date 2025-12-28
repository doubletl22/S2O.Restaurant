using S20.Services.Tenants.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Interfaces
{
    public interface ITenantServices
    {
        Task<TenantResponse> CreateTenantAsync(CreateTenantRequest request);
        Task<IEnumerable<UserTenantDto>> GetUserTenantsAsync(Guid userId);
        Task<bool> ToggleTenantStatusAsync(Guid tenantId, bool isActive);
    }
}
