using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S20.Services.Tenants.Application.DTOs
{
    public class CreateTenantRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Code { get; set; } = string.Empty;
        public Guid OwnerUserId { get; set; }
    }
}
