namespace S2O.Catalog.App.DTOs;

public class ProductResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; } // Cho phép null
    public string? ImageUrl { get; set; }
}