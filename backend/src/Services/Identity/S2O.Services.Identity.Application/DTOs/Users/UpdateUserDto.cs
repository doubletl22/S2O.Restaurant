using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs.Users
{
    public class UpdateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
