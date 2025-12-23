using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs
{
    public class AssignRoleDTO
    {
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }
}
