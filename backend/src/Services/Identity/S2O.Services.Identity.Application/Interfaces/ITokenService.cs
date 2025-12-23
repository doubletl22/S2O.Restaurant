using S2O.Services.Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface ITokenService
    {
<<<<<<< HEAD
        public string CreateAccessToken(User user, IList<string> roles, IList<string> permissions);
=======
        public string CreateAccessToken(User user, IList<string> roles);
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
        RefreshToken CreateRefreshToken(string ipAddress);

    }
}
