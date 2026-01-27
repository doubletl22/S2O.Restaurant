using S2O.Catalog.App.DTOs;

namespace S2O.Catalog.App.Features.Public;

public class PublicMenuDto
{
    public Guid TenantId { get; set; }
    public List<CategoryResponse> Categories { get; set; } = new();
    public List<ProductResponse> Products { get; set; } = new();
}