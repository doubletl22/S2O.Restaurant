using Microsoft.AspNetCore.Http;
using S20.Services.Tenants.Application.Interfaces;
using S20.Services.Tenants.Application.Interfaces.Repositories;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace S20.Services.Tenants.Application.Services
{
    public class TenantProvider : ITenantProvider
    {
        private readonly IHttpContextAccessor _httpContextAccesstor;
        private readonly ITenantUnitOfWork _uow;

        public TenantProvider(IHttpContextAccessor httpContextAccesstor,ITenantUnitOfWork uow)
        {
            _httpContextAccesstor = httpContextAccesstor;
            _uow = uow;
        }

        public Guid? TenantId
        {
            get
            {
                if (UserId == null)
                {
                    return null;
                }
                var tenantUser = _uow.TenantUsers.GetByUserIdAsync(UserId!.Value).Result;
                return tenantUser?.FirstOrDefault()?.TenantId;

            }
        }

        public Guid? UserId
        {
            get
            {
                var user = _httpContextAccesstor.HttpContext?.User;
                var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                  ?? user?.FindFirst("sub")?.Value;

                return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
            }
        } 
    }
}
