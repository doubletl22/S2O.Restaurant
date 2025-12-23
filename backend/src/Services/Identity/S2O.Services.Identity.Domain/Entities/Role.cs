using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Domain.Entities
{
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<RolePermission> RolePermissions{ get; set; } = new List<RolePermission>();
    }
}
<<<<<<< HEAD
 
=======
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
