using S2O.Services.Identity.Infrastructure.Firebase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IFirebaseService
    {
        Task<FirebaseUserInfo> VerifyTokenAsync(string idToken);
    }
}
