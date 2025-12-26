using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Application.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; } 

        [Required(ErrorMessage = "Mật khẩu")]
        [PasswordPropertyText]
        public required string Password { get; set; }

        public required Guid TenantId { get; set; }
    }
}
