using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = default!; 
        public string Password { get; set; } = default!; 
        public string TenantCode { get; set; } = string.Empty;
    }
}
