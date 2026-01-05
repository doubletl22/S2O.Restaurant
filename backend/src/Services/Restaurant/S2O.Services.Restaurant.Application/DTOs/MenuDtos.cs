namespace S2O.Services.Restaurant.Application.DTOs
{
    public record CreateCategoryRequest(Guid RestaurantId, string Name);

    public record CreateDishRequest(Guid RestaurantId, Guid CategoryId, string Name, decimal Price, string? Description, string? ImageUrl);

    // DTO trả về cho Client (Clean, không lộ Entity)
    public class MenuDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public List<DishDto> Dishes { get; set; } = new();
    }

    public class DishDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
    }
}