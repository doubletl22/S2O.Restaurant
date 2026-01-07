using S2O.Services.Identity.Application.DTOs.Users;
using S2O.Services.Identity.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.UseCase.Users
{
    public class SearchUserByEmailHandler
    {
        private readonly IUserRepository _userRepository;

        public SearchUserByEmailHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserDto> HandleAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if(user == null)
            {
                throw new Exception("User không tồn tại");
            }

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                IsActive = user.IsActive
            };
        }
    }
}
