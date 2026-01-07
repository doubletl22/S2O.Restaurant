using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase.Users
{
    public class AssignUserToTenantHandler
    {
        private readonly IUserRepository _users; 
        private readonly ITenantRepository _tenants; 
        private readonly IUserTenantRepository _userTenants; 

        public AssignUserToTenantHandler(IUserRepository users, 
            ITenantRepository tenants, 
            IUserTenantRepository userTenants) 
        {
            _users = users; 
            _tenants = tenants;
            _userTenants = userTenants;
        }
        public async Task HandleAsync(Guid userId, string tenantCode)
        {
            var user = await _users.GetByIdAsync(userId);
            if (user == null) 
                throw new Exception("User không tồn tại"); 
            
            var tenant = await _tenants.GetByCodeAsync(tenantCode); 
            if (tenant == null) throw new Exception("Tenant không tồn tại"); 
            
            var exists = await _userTenants.ExistsInTenantAsync(userId, tenant.Id); 
            if (!exists) { await _userTenants.AddAsync(new UserTenant 
            {
                UserId = userId, 
                TenantId = tenant.Id 
            }); 
            }
        }
    }
}
