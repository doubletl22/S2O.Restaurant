using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Domain.Entities
{
    public class Tenant
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ICollection<UserTenant> Users { get; set; } = new List<UserTenant>();
    }
}
