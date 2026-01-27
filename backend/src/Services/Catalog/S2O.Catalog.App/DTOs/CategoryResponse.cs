namespace S2O.Catalog.App.DTOs;

public class CategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<ProductResponse> Products { get; set; } = new();
    public Guid CategoryId { get; set; }
}