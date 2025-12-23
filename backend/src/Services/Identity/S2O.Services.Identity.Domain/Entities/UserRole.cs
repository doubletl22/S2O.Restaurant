namespace S2O.Services.Identity.Domain.Entities
{
    public class UserRole
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid RoleId { get; set; }
        public Role Role { get; set; } = null!;
<<<<<<< HEAD
        public Guid TenantId { get; set; }
=======
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
    }
}