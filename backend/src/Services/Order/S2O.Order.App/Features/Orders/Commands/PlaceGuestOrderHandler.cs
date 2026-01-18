using MediatR;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities; // Entity Order của bạn
using S2O.Shared.Kernel.Results;
using S2O.Order.Domain.Enums;

namespace S2O.Order.App.Features.Orders.Commands;

public class PlaceGuestOrderHandler : IRequestHandler<PlaceGuestOrderCommand, Result<Guid>>
{
    private readonly IOrderDbContext _context;
    private readonly IOrderNotifier _notifier;
    // (Có thể inject thêm CatalogClient để check giá tiền nếu cần)

    public PlaceGuestOrderHandler(IOrderDbContext context, IOrderNotifier notifier)
    {
        _context = context;
        _notifier = notifier;
    }

    public async Task<Result<Guid>> Handle(PlaceGuestOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Tạo đơn hàng mới
        var order = new Domain.Entities.Order
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,   // Gán thủ công
            BranchId = request.BranchId,   // Gán thủ công
            // UserId = null,             // Khách vãng lai -> Null
            TableId = request.TableId,     // Bàn số mấy
            Status = OrderStatus.Pending,           // Trạng thái chờ bếp nhận
            TotalAmount = 0,               // Tính sau hoặc tính ngay ở đây
            CreatedAtUtc = DateTime.UtcNow,
            Note = $"Khách lẻ: {request.GuestName} - {request.GuestPhone}"
        };

        // 2. Thêm món (Logic đơn giản, nên gọi Catalog check giá thực tế)
        foreach (var item in request.Items)
        {
            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = 50000 // Tạm fix cứng hoặc phải gọi Catalog để lấy giá chuẩn
            };
            order.TotalAmount += orderItem.UnitPrice * orderItem.Quantity;
            order.Items.Add(orderItem); // Giả sử bạn có List<OrderItem> trong Order
        }

        // 3. Lưu xuống DB
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
        await _notifier.NotifyNewOrderAsync(order.BranchId, order.Id);
        return Result<Guid>.Success(order.Id);
    }
}