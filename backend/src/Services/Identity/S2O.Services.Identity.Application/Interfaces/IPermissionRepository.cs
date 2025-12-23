using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.Interfaces
{
    public interface IPermissionRepository
    {
        Task<IList<string>> GetPermissionsByRolesIdAsync(IList<Guid> rolesId);
    }
}
