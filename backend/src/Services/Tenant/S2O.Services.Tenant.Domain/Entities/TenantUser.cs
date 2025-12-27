using S2O.Services.Tenants.Domain.Entities;

namespace S2O.Services.Tenants.Domain.Entities
{
    public class TenantUser
    {
        public Guid Id{ get; set; }
        public Guid UserId{ get; set; }
        public Guid TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
        public bool IsOwner { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public ICollection<TenantUserRole> Roles { get; set; } = new List<TenantUserRole>();

    }
}
