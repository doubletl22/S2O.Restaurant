

namespace S2O.Services.Identity.Domain.Entities
{
    public class User 
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Role { get; set; } = "Customer";
        public Guid? TenantId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
