using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs
{
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty; 
        public DateTime ExpiresAt { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshExpiresAt { get; set; }
    }
}
