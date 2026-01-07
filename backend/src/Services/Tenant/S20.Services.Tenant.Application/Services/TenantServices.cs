using S20.Services.Tenants.Application.DTOs;
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
    public class TenantServices : ITenantServices
    {
        private readonly ITenantUnitOfWork _uow;

        public TenantServices(ITenantUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<TenantResponse> CreateTenantAsync(CreateTenantRequest request)
        {
            var isExist = await _uow.Tenants.ExistsByCodeAsync(request.Code);
            if (isExist)
            {
                throw new Exception("Mã nhà hàng đã tồn tại trên hệ thống.");
            }

            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Code = request.Code,
                IsActive = true,
                CreateAt = DateTime.UtcNow,
            };

            var owner = new TenantUser
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                UserId = request.OwnerUserId,
                IsOwner = true,
                JoinedAt = DateTime.UtcNow,
            };

            await _uow.Tenants.AddAsync(tenant);
            await _uow.TenantUsers.AddAsync(owner);

            await _uow.CompleteAsync();

            return new TenantResponse
            {
                Id = tenant.Id,
                Name = request.Name,
                Code = request.Code,
                IsActive = true,
                CreateAt = tenant.CreateAt,
            };
        }

        public async Task<IEnumerable<UserTenantDto>> GetUserTenantsAsync(Guid userId)
        {
            var relations = await _uow.TenantUsers.GetByUserIdAsync(userId);
            return relations.Select(x => new UserTenantDto
            {
                TenantId = x.TenantId,
                IsOwner = x.IsOwner,
                JoinedAt = x.JoinedAt,
            });
        }

        public async Task<bool> ToggleTenantStatusAsync(Guid tenantId, bool isActive)
        {
            var tenant = await _uow.Tenants.GetByIdAsync(tenantId);
            if (tenant == null)
            {
                return false;
            }

            tenant.IsActive = isActive;
            _uow.Tenants.Update(tenant);

            return await _uow.CompleteAsync() > 0;
        }
    }
}
