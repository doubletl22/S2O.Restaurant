using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IFirebaseService _firebaseService;
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public AuthService(
            IFirebaseService firebaseService,
            IUserRepository userRepository,
            IJwtService jwtService)
        {
            _firebaseService = firebaseService;
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<string> FirebaseLoginAsync(string idToken)
        {
            // 1. Verify Firebase token
            var firebaseUser = await _firebaseService.VerifyTokenAsync(idToken);

            // 2. Map Firebase → User nội bộ
            var user = await _userRepository.GetByEmailAsync(firebaseUser.Email);

            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = firebaseUser.Email,
                    Role = "Customer"
                };

                await _userRepository.AddAsync(user);
            }

            // 3. Cấp JWT hệ thống
            return _jwtService.GenerateToken(user);
        }
    }
}
