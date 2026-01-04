namespace S2O.Services.Identity.Application.DTOs
{
    public class AuthResponse
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; // Thêm trường này
        public string Role { get; set; } = string.Empty;  // Thêm trường này
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}