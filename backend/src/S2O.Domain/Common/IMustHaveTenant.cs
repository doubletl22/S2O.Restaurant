public interface IMustHaveTenant
{
    public string TenantId { get; set; } // Phân biệt dữ liệu giữa các nhà hàng [cite: 19, 54]
}

// S2O.Domain/Entities/Dish.cs
public class Dish : IMustHaveTenant
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    [cite: 14]
    public string TenantId { get; set; } // Liên kết với nhà hàng cụ thể [cite: 19]
}