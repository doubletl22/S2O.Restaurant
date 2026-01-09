using S2O.Shared.Kernel.Primitives;
namespace S2O.Catalog.Domain.Entities;

public class Category : IAuditableEntity, IMustHaveTenant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Thuộc tính bắt buộc cho Multi-tenant
    public Guid TenantId { get; set; }

    // Thuộc tính Audit
    public DateTime CreatedAtUtc { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
    public string? LastModifiedBy { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}