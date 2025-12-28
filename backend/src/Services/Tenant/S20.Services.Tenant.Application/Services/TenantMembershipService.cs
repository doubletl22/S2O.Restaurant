using S20.Services.Tenants.Application.Interfaces;
using S20.Services.Tenants.Application.Interfaces.Repositories;
using S2O.Services.Tenants.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Services
{
    public class TenantMembershipService : ITenantMembershipService
    {
        private readonly ITenantUnitOfWork _uow;
        private readonly ITenantProvider _tenantProvider;

        public TenantMembershipService(ITenantUnitOfWork uow, ITenantProvider tenantProvider)
        {
            _uow = uow;
            _tenantProvider = tenantProvider;
        }

        public async Task AddAddUserToTenantAsync(Guid tenantId, Guid userId, Guid roleId)
        {
            if (_tenantProvider.TenantId != tenantId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền quản lý nhàng hàng này!");
            }

            var existing = await _uow.TenantUsers.GetUserInTenantAsync(userId, tenantId);
            if (existing != null)
            {
                throw new Exception("Người này đã là nhân viên của quán");
            }

            var membership = new TenantUser
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                IsOwner = false,
                JoinedAt = DateTime.UtcNow,
            };

            await _uow.TenantUsers.AddAsync(membership);
            await _uow.CompleteAsync();


        }

        public async Task RemoveUserFromTenantAsync(Guid tenantId, Guid userId)
        {
            var membership = await _uow.TenantUsers.GetUserInTenantAsync(userId, tenantId);
            if(membership == null)
            {
                throw new Exception("Không tìm thấy nhiên viên này trong hệ thống");
            }

            if (membership.IsOwner)
            {
                throw new Exception("Không thể xóa chủ sỡ hữu nhà hàng");
            }

            _uow.TenantUsers.Delete(membership);
            await _uow.CompleteAsync();
        }
    }
}
