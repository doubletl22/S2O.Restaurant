

namespace S2O.Services.Identity.Domain.Entities
{
    public class User 
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Guid? TenantId { get; set; } //system Admin
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    }
}
