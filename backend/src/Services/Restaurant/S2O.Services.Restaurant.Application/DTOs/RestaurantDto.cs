namespace S2O.Services.Restaurant.Application.DTOs
{
    // Request khi Chủ quán đăng ký quán mới
    public record CreateRestaurantRequest(string Name, string Address, string PhoneNumber);

    // Response trả về
    public class RestaurantResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Address { get; set; } = default!;
        public bool IsActive { get; set; }
    }
}