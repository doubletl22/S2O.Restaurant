using System.ComponentModel.DataAnnotations;

namespace S2O.Services.Identity.Application.DTOs
{
    public class RegisterRequest
    {
        [Required] public string UserName { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
        [Required] public string ConfirmPassword { get; set; } = string.Empty;
        public string? Role { get; set; } = "Customer"; // Quan trọng
    }
}