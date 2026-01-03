using S2O.Services.Identity.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase.Users
{
    public class UpdateUserStatusHandler
    {
        private readonly IUserRepository _userRepository;

        public UpdateUserStatusHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task HandleAsync(Guid userId, bool isActive)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User không tồn tại");
            }
            user.IsActive = isActive;
            await _userRepository.UpdateAsync(user);
        }
    }
}
