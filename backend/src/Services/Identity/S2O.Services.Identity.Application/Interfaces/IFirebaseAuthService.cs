using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;
using S2O.Services.Identity.Domain.Entities;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IFirebaseAuthService
    {
        Task<FirebaseUserDto?> VerifyTokenAsync(string firebaseIdToken);
    }
}
