using Microsoft.EntityFrameworkCore;

namespace S2O.AIService.Data;

public sealed class Restaurant
{
    public Guid Id { get; set; }
    public required string TenantId { get; set; }
    public required string RestaurantId { get; set; } // business key
    public required string Name { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }

    // demo: lưu giờ mở cửa JSON (hoặc string)
    public string OpenHoursJson { get; set; } = "{}";
}

public sealed class MenuItem
{
    public Guid Id { get; set; }
    public required string TenantId { get; set; }
    public required string RestaurantId { get; set; }
    public required string Name { get; set; }
    public string? Category { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? Description { get; set; }
}

public enum TableStatus { Free = 0, Occupied = 1, Reserved = 2 }

public sealed class DiningTable
{
    public Guid Id { get; set; }
    public required string TenantId { get; set; }
    public required string RestaurantId { get; set; }
    public required string TableNo { get; set; }
    public TableStatus Status { get; set; } = TableStatus.Free;
}

public sealed class Order
{
    public Guid Id { get; set; }
    public required string TenantId { get; set; }
    public required string RestaurantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = new();
}

public sealed class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public required string ItemName { get; set; }
    public int Qty { get; set; }
}

public sealed class RestaurantDoc
{
    public Guid Id { get; set; }
    public required string TenantId { get; set; }
    public required string RestaurantId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
