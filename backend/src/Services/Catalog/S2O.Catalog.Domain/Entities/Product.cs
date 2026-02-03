namespace S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Primitives;

public class Product : IAuditableEntity, IMustHaveTenant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;   

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public Guid? TenantId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
    public string? LastModifiedBy { get; set; }
}