using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs
{
    public class LoginRequestDto
    {
        public string FirebaseIdToken { get; set; } = string.Empty; 
        public string TenantCode { get; set; } = string.Empty;
    }
}

