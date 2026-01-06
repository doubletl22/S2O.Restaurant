using S2O.Services.Identity.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs.Users
{
    public class DeleteUserHandler
    {
        private readonly IUserRepository _users;

        public DeleteUserHandler(IUserRepository users)
        {
            _users = users;
        }

        public async Task HandleAsync(Guid userId)
        {
            var user = await _users.GetByIdAsync(userId);
            if (user == null)
                throw new Exception("Người dùng không tồn tại");

            await _users.DeleteUser(user);
        }

    }
}
