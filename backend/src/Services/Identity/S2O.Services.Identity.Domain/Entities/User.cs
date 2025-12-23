using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Domain.Entities
{
    public class User 
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Guid? TenantId { get; set; } //system Admin
<<<<<<< HEAD
        public bool IsActive { get; set; } = true;
=======
        public bool IsActive { get; set; } = false;
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    }
}
