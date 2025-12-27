using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using S2O.Services.Tenants.Domain.Entities;

namespace S2O.Services.Tenants.Domain.Entities
{
    public class Tenant
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public bool IsActive { get; set; } 
        public DateTime CreateAt { get; set; } = DateTime.Now;

        public ICollection<TenantUser> TenantUsers { get; set; } = new List<TenantUser>();
    }
}
