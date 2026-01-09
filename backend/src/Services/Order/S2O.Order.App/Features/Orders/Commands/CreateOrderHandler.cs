using MediatR;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities;
using S2O.Shared.Interfaces;
using S2O.Shared.Kernel.Results;
using OrderEntity = S2O.Order.Domain.Entities.Order;

namespace S2O.Order.App.Features.Orders.Commands.CreateOrder;

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Result<Guid>>
{
    private readonly IOrderDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly ICatalogClient _catalogClient; // Thêm Client này

    public CreateOrderHandler(IOrderDbContext context, ITenantContext tenantContext, ICatalogClient catalogClient)
    {
        _context = context;
        _tenantContext = tenantContext;
        _catalogClient = catalogClient;
    }

    public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Khởi tạo đơn hàng
        var order = new OrderEntity
        {
            Id = Guid.NewGuid(),
            // Map các thông tin cơ bản
            TableId = Guid.NewGuid(), // Tạm thời hoặc lấy từ request
            TenantId = _tenantContext.TenantId ?? Guid.Empty,
            Status = OrderStatus.Pending,
            OrderNumber = $"S2O-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}"
        };

        decimal totalAmount = 0;

        // 2. Duyệt qua từng món ăn để lấy giá thực tế từ Catalog Service
        foreach (var itemRequest in request.Items)
        {
            // GỌI HTTPCLIENT SANG CATALOG SERVICE
            var product = await _catalogClient.GetProductAsync(itemRequest.ProductId);

            if (product == null)
            {
                return Result<Guid>.Failure(new Error("Order.ProductNotFound", $"Món ăn {itemRequest.ProductId} không tồn tại hoặc đã bị xóa."));
            }

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = product.Id,
                ProductName = product.Name, // Lưu tên món tại thời điểm đặt
                UnitPrice = product.Price,  // Lấy giá chuẩn từ Catalog, không dùng giá request
                Quantity = itemRequest.Quantity
            };

            order.Items.Add(orderItem);
            totalAmount += orderItem.TotalPrice;
        }

        order.TotalAmount = totalAmount;

        // 3. Lưu toàn bộ (Order + OrderItems) vào database
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(order.Id);
    }
}