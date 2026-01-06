<<<<<<< HEAD
﻿using Microsoft.AspNetCore.Identity;
=======
﻿using FirebaseAdmin.Auth.Multitenancy;
using Microsoft.AspNetCore.Identity;
>>>>>>> f5342a11e7fc2e575843751d2d0873992823dccb
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Application.UseCase.Users;
using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase
{
    public class RegisterUserHandler
    {
        private readonly IUserRepository _users;
        private readonly ITenantRepository _tenants;
        private readonly IUserTenantRepository _userTenants;
        private readonly IPasswordHasher _hasher;
        public RegisterUserHandler(IUserRepository users,
            ITenantRepository tenants,
            IUserTenantRepository userTenants,
            IPasswordHasher hasher)
        {
            _users = users;
            _tenants = tenants;
            _userTenants = userTenants;
            _hasher = hasher;
        }
        public async Task HandleAsync(RegisterRequestDto dto)
        {
            if (await _users.ExistsByEmailAsync(dto.Email))
                throw new Exception("Email đã tồn tại");

            var tenant = await _tenants.GetByCodeAsync(dto.TenantCode);
            if (tenant == null)
                throw new Exception("Tenant không tồn tại");
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                FullName = dto.FullName,
                PasswordHash = _hasher.Hash(dto.Password),
                Role = "Customer",
                IsActive = true
            };
            await _users.AddAsync(user);
<<<<<<< HEAD

            var userTenant = new UserTenant
            {
                UserId = user.Id,
                TenantId = tenant.Id
            };

            await _userTenants.AddAsync(userTenant);
=======
>>>>>>> f5342a11e7fc2e575843751d2d0873992823dccb
        }
    }
}
