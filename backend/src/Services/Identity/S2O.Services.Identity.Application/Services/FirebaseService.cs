using FirebaseAdmin.Auth;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Infrastructure.Firebase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using S2O.Services.Identity.Application.Services;

namespace S2O.Services.Identity.Infrastructure.Firebase
{
    public class FirebaseService : IFirebaseService
    {
        public async Task<FirebaseUserInfo> VerifyTokenAsync(string idToken)
        {
            var decoded = await FirebaseAuth.DefaultInstance
                .VerifyIdTokenAsync(idToken);

            return new FirebaseUserInfo
            {
                Uid = decoded.Uid,
                // Sử dụng TryGetValue hoặc kiểm tra chứa Key trước khi lấy
                Email = decoded.Claims.ContainsKey("email")
                    ? decoded.Claims["email"]?.ToString()!
                    : "",
            };
        }
    }
}
