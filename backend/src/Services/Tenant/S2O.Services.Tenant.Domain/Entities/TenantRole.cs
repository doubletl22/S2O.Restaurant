using S2O.Services.Tenants.Domain.Entities;
namespace S2O.Services.Tenants.Domain.Entities
{
    public class TenantRole
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public ICollection<TenantUserRole> UserRoles { get; set; } = new List<TenantUserRole>();
    }
}
