using S2O.Services.Tenants.Domain.Entities;

namespace S2O.Services.Tenants.Domain.Entities
{
    public class TenantUserRole
    {
        public Guid TenantUserId { get; set; }
        public TenantUser TenantUser { get; set; } = null!;
        public Guid TenantRoleId { get; set; }
        public TenantRole TenantRole { get; set; } = null!;

    }
}
