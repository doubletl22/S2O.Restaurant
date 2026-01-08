using Microsoft.AspNetCore.Identity;
using S2O.Shared.Kernel.Primitives;
namespace S2O.Auth.Domain.Entities;
public class ApplicationUser : IdentityUser, ITenantEntity
{
    public string FullName { get; set; } = string.Empty;

    // Thuộc tính bắt buộc cho Multi-tenant
    public string TenantId { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}