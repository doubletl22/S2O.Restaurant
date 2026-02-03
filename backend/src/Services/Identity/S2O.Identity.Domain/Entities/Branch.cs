using S2O.Shared.Kernel.Primitives; // Để dùng Entity gốc
using System.ComponentModel.DataAnnotations.Schema;

namespace S2O.Identity.Domain.Entities;

[Table("Branches")] 
public class Branch : Entity 
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}