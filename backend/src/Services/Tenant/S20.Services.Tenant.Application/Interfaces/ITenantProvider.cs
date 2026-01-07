using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.Interfaces
{
    public interface ITenantProvider
    {
        Guid? TenantId { get; }
        Guid? UserId { get; }
    }
}
