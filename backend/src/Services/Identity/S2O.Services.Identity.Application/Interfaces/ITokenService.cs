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
        public string CreateAccessToken(User user);
        RefreshToken CreateRefreshToken(string ipAddress);

    }
}
