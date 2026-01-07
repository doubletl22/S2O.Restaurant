using S2O.Services.Identity.Application.DTOs.Users;
using S2O.Services.Identity.Application.Interfaces;


namespace S2O.Services.Identity.Application.UseCase.Users
{
    public class GetUserByTenantHandler
    {
        private readonly IUserRepository _users; 
        private readonly ITenantRepository _tenants; 
        public GetUserByTenantHandler(IUserRepository users, ITenantRepository tenants) 
        { 
            _users = users; _tenants = tenants;
        }
        public async Task<IEnumerable<UserDto>> HandleAsync(string tenantCode) 
        {
            var tenant = await _tenants.GetByCodeAsync(tenantCode);

            if (tenant == null) 
                throw new Exception("Tenant không tồn tại"); 

            var users = await _users.GetByTenantIdAsync(tenant.Id);
            return users.Select(u => new UserDto{
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                IsActive = u.IsActive
            }); 
        }
    }
}
