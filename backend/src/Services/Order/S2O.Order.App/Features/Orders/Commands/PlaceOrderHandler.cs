using MediatR;
using S2O.Order.App.Abstractions;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

public class PlaceOrderHandler : IRequestHandler<PlaceOrderCommand, Result<Guid>>
{
    private readonly IOrderDbContext _context;
    private readonly ICatalogClient _catalogClient;
    private readonly ITenantContext _tenantContext;

    public PlaceOrderHandler(IOrderDbContext context, ICatalogClient catalogClient, ITenantContext tenantContext)
    {
        _context = context;
        _catalogClient = catalogClient;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(PlaceOrderCommand request, CancellationToken ct)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = $"S2O-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}",
            TableId = request.TableId,
            TenantId = _tenantContext.TenantId ?? Guid.Empty,
            Status = OrderStatus.Pending
        };

        decimal totalAmount = 0;

        foreach (var itemRequest in request.Items)
        {
            // GỌI SANG CATALOG SERVICE LẤY GIÁ THẬT
            var product = await _catalogClient.GetProductAsync(itemRequest.ProductId);
            if (product == null) return Result<Guid>.Failure(new Error("Order.ProductNotFound", $"Món ăn {itemRequest.ProductId} không tồn tại"));

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = itemRequest.Quantity,
                OrderId = order.Id
            };

            order.Items.Add(orderItem);
            totalAmount += orderItem.TotalPrice;
        }

        order.TotalAmount = totalAmount;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(order.Id);
    }
}