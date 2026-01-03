using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Infrastructure.Services
{
    public class FirebaseAuthService : IFirebaseAuthService
    {
        private readonly ILogger<FirebaseAuthService> _logger;

        public FirebaseAuthService(ILogger<FirebaseAuthService> logger)
        {
            _logger = logger;
        }

        public async Task<FirebaseUserDto?> VerifyTokenAsync(string firebaseIdToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(firebaseIdToken)) 
                    return null;

                var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(firebaseIdToken);
                if (decoded?.Claims == null || !decoded.Claims.TryGetValue("email", out var emailObj)) 
                    throw new Exception("Firebase token does not contain email claim.");

                var email = emailObj?.ToString();
                var name = decoded.Claims.TryGetValue("name", out var nameObj) ? nameObj?.ToString() : email;

                if (string.IsNullOrWhiteSpace(email)) 
                    throw new Exception("Firebase token does not contain email claim.");

                return new FirebaseUserDto
                {
                    Email = email ?? string.Empty,
                    FullName = name ?? string.Empty,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during Firebase token verification");
                throw;
            }
        }
    }
}
