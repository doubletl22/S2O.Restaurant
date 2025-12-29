using S20.Services.Tenants.Application.DTOs;
using S20.Services.Tenants.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Services
{
    public class TenantServices : ITenantServices
    {
    

        public Task<TenantResponse> CreateTenantAsync(CreateTenantRequest request, Guid systemAdminUserId)
        {
            throw new NotImplementedException();
        }
    }
}
