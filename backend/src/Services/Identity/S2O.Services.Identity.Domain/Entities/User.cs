

namespace S2O.Services.Identity.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Role { get; set; } = "Customer";
        public bool IsActive { get; set; } = true;
        public ICollection<UserTenant> Tenants { get; set; } = new List<UserTenant>();
    }
}
