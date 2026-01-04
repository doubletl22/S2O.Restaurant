namespace S2O.Services.Ordering.Application.DTOs
{
    public class CreateOrderRequest
    {
        public Guid RestaurantId { get; set; }
        public Guid TableId { get; set; }
        public string? Note { get; set; } // Note chung
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public Guid MenuId { get; set; }
        public string ProductName { get; set; } = default!;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; } // Note riêng từng món
    }
}