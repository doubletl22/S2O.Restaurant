namespace S2O.Identity.Domain.Entities;

using Microsoft.AspNetCore.Identity;
using S2O.Shared.Kernel.Primitives;

public class ApplicationUser : IdentityUser<Guid>, ITenantEntity
{
    public string FullName { get; set; } = string.Empty;

    public Guid? TenantId { get; set; }
    public Guid? BranchId { get; set; } 
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}