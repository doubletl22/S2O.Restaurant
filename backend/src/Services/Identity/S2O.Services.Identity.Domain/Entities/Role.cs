namespace S2O.Services.Identity.Domain.Entities
{
    public class Role
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<RolePermission> RolePermissions{ get; set; } = new List<RolePermission>();
    }
}
 

