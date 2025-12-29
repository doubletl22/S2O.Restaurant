using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.DTOs
{
    public class UserTenantDto
    {
        public Guid TenantId { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public string TenatCode { get; set; } = string.Empty;
        public bool IsOwner { get; set; }
        public DateTime JoinedAt { get; set; }

    }
}
