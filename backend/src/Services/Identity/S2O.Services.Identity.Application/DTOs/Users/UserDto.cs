using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs.Users
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty; 
        public string FullName { get; set; } = string.Empty; 
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public UserDto() { }

        public UserDto(Guid id, string email, string fullName, string role, bool isActive)
        {
            Id = id;
            Email = email;
            FullName = fullName;
            Role = role;
            IsActive = isActive;
        }
    }
}

