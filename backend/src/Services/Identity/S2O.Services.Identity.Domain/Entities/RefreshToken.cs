using System.ComponentModel.DataAnnotations.Schema;

namespace S2O.Services.Identity.Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime Expires { get; set; }
        public DateTime Created { get; set; }
        public string CreatedByIp { get; set; } = string.Empty;
        public DateTime? Revoked { get; set; }
        public string? RevokedByIp { get; set; }
        public string? ReplacedByToken { get; set; }

<<<<<<< HEAD
        public bool IsExpired => DateTime.UtcNow >= Expires;
        public bool IsActive => Revoked == null && !IsExpired;
=======
        public bool isExpired => DateTime.UtcNow >= Expires;
        public bool IsActive => Revoked == null && !isExpired;
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7

        public Guid UserId { get; set; } 
        public User User { get; set; } = null!;
    }
}