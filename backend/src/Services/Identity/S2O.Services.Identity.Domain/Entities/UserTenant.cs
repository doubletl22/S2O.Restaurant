namespace S2O.Services.Identity.Domain.Entities
{
    public class UserTenant
    {
        public Guid UserId { get; set; }
        public Guid TenantId { get; set; }
        public User User { get; set; } = null!;
        public Tenant Tenant { get; set; } = null!;
    }
}