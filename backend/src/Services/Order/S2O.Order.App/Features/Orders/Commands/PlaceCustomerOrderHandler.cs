using MediatR;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;
using OrderEntity = S2O.Order.Domain.Entities.Order;
using OrderItemEntity = S2O.Order.Domain.Entities.OrderItem;

namespace S2O.Order.App.Features.Orders.Commands;

public class PlaceCustomerOrderHandler : IRequestHandler<PlaceCustomerOrderCommand, Result<Guid>>
{
    private readonly IOrderDbContext _context;
    private readonly IOrderNotifier _notifier;
    public PlaceCustomerOrderHandler(IOrderDbContext context, IOrderNotifier notifier)
    {
        _context = context;
        _notifier = notifier;
    }

    public async Task<Result<Guid>> Handle(PlaceCustomerOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Dùng Alias 'OrderEntity' thay vì 'Order'
        var order = new OrderEntity
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            BranchId = request.BranchId,
            TableId = request.TableId,
            UserId = request.UserId,
            Status = OrderStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
            Note = $"Thành viên: {request.UserName}",
            TotalAmount = 0
        };

        // 2. Thêm món ăn
        if (request.Items != null && request.Items.Any())
        {
            foreach (var itemDto in request.Items)
            {
                // Dùng Alias 'OrderItemEntity'
                var orderItem = new OrderItemEntity
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = 50000 // Tạm fix cứng giá
                };

                order.TotalAmount += orderItem.UnitPrice * orderItem.Quantity;
                order.Items.Add(orderItem);
            }
        }

        // 3. Lưu xuống Database
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
        await _notifier.NotifyNewOrderAsync(order.BranchId, order.Id);
        return Result<Guid>.Success(order.Id);
    }
}