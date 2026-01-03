using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Shared.Multitenancy
{
    public interface ITenantContext
    {
        public string? TenantId { get; set; }
    }
}
