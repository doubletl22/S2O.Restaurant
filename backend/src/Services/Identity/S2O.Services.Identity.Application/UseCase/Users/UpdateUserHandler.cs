using S2O.Services.Identity.Application.DTOs.Users;
using S2O.Services.Identity.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase.Users
{
    public class UpdateUserHandler
    {
        private readonly IUserRepository _users; 
        public UpdateUserHandler(IUserRepository users)
        { 
            _users = users;
        }
        public async Task HandleAsync(Guid userId, UpdateUserDto dto) 
        { var user = await _users.GetByIdAsync(userId);
            if (user == null) 
                throw new Exception("User không tồn tại"); 

            user.FullName = dto.FullName; 
            user.Role = dto.Role; await _users.UpdateAsync(user);
        }
    }
}
