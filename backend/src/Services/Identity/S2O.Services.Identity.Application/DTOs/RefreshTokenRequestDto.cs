using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs
{
    public class RefreshTokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
