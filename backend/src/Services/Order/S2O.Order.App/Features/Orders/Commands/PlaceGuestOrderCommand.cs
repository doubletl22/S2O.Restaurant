using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Order.Domain.Entities;
using S2O.Order.App.Abstractions;

namespace S2O.Order.App.Features.Orders.Commands;

// DTO cho món ăn
public record GuestOrderItemDto(Guid ProductId, int Quantity, string? Note);

// Command
public record PlaceGuestOrderCommand(
    Guid TableId,
    string GuestName,
    List<GuestOrderItemDto> Items
) : IRequest<Result<Guid>>; // Trả về OrderId

// Handler
public class PlaceGuestOrderHandler : IRequestHandler<PlaceGuestOrderCommand, Result<Guid>>
{
    private readonly IOrderDbContext _context;
    // Inject thêm service lấy giá sản phẩm nếu cần (để đơn giản có thể tin tưởng Frontend gửi giá hoặc gọi CatalogClient)

    public PlaceGuestOrderHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(PlaceGuestOrderCommand request, CancellationToken ct)
    {
        // 1. Tạo Order mới
        var order = new S2O.Order.Domain.Entities.Order
        {
            Id = Guid.NewGuid(),
            TableId = request.TableId,
            GuestName = request.GuestName,
            Status = OrderStatus.Pending, // Trạng thái chờ bếp xác nhận
            CreatedAtUtc = DateTime.UtcNow,
            // TenantId sẽ được tự động gán bởi Interceptor hoặc bạn gán thủ công từ TenantContext

            // Map Items
            Items = request.Items.Select(x => new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = x.ProductId,
                Quantity = x.Quantity,
                // Đơn giá nên lấy từ DB Catalog để bảo mật, nhưng làm đồ án có thể fix cứng hoặc lấy từ request tạm thời
                UnitPrice = 0, // Cần xử lý logic lấy giá
                Note = x.Note
            }).ToList()
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(order.Id);
    }
}