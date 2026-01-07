using S2O.Services.Identity.Application.DTOs.Users;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase.Users
{
    public class CreateUserHandler
    {
        private readonly IUserRepository _users;
        private readonly IPasswordHasher _hasher;

        public CreateUserHandler(IUserRepository users, IPasswordHasher hasher)
        {
            _users = users;
            _hasher = hasher;
        }

        public async Task<Guid> HandleAsync(CreateUserDto dto)
        {
            var exiting = await _users.GetByEmailAsync(dto.Email);
            if (exiting != null)
            {
                throw new InvalidOperationException("Email đã tồn tại");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                FullName = dto.FullName,
                PasswordHash = _hasher.Hash(dto.Password),
                Role = dto.Role,
                IsActive = true,
            };

            await _users.AddAsync(user);
            
            return user.Id;
        }

    }
}
