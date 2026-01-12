using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class PlaceGuestOrderHandler : ICommandHandler<PlaceGuestOrderCommand, Guid>
{
    private readonly IOrderDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly ICatalogClient _catalogClient;

    public PlaceGuestOrderHandler(
        IOrderDbContext context,
        ITenantContext tenantContext,
        ICatalogClient catalogClient)
    {
        _context = context;
        _tenantContext = tenantContext;
        _catalogClient = catalogClient;
    }

    public async Task<Result<Guid>> Handle(PlaceGuestOrderCommand request, CancellationToken ct)
    {
        // 1. Kiểm tra Tenant
        if (_tenantContext.TenantId == null)
        {
            return Result<Guid>.Failure(new Error("Order.TenantMissing", "Không xác định được nhà hàng (Thiếu TenantId)."));
        }

        var orderItems = new List<OrderItem>();
        decimal totalAmount = 0;

        // 2. Duyệt qua từng món
        foreach (var itemDto in request.Items)
        {
            var product = await _catalogClient.GetProductAsync(itemDto.ProductId);

            if (product == null)
            {
                return Result<Guid>.Failure(new Error("Order.ProductNotFound", $"Món ăn {itemDto.ProductId} không tồn tại hoặc đã hết."));
            }

            var itemTotal = product.Price * itemDto.Quantity;
            totalAmount += itemTotal;

            orderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = itemDto.Quantity,
                Note = itemDto.Note,
                TenantId = _tenantContext.TenantId.Value
            });
        }

        // 3. Tạo đơn hàng
        var order = new Domain.Entities.Order
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId.Value,
            TableId = request.TableId,
            CustomerName = request.GuestName,
            OrderNumber = GenerateOrderNumber(),
            Status = OrderStatus.Pending,
            TotalAmount = totalAmount,
            CreatedAtUtc = DateTime.UtcNow,
            Items = orderItems
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(order.Id);
    }

    private static string GenerateOrderNumber()
    {
        return $"S2O-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";
    }
}