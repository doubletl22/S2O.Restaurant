using MediatR;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class PlaceGuestOrderHandler : IRequestHandler<PlaceGuestOrderCommand, Result<Guid>>
{
    private readonly IOrderDbContext _context;
    private readonly ICatalogClient _catalogClient; // Service gọi sang Catalog
    private readonly ITableResolverClient _tableResolverClient;
    private readonly ITenantClient _tenantClient; // Check tenant lock status

    public PlaceGuestOrderHandler(
        IOrderDbContext context,
        ICatalogClient catalogClient,
        ITableResolverClient tableResolverClient,
        ITenantClient tenantClient)
    {
        _context = context;
        _catalogClient = catalogClient;
        _tableResolverClient = tableResolverClient;
        _tenantClient = tenantClient;
    }

    public async Task<Result<Guid>> Handle(PlaceGuestOrderCommand request, CancellationToken ct)
    {
        var resolvedTable = await _tableResolverClient.ResolveAsync(request.TableId, ct);
        if (resolvedTable == null)
        {
            return Result<Guid>.Failure(new Error("Order.InvalidTable", "Không xác thực được bàn cho đơn hàng này."));
        }

        if (resolvedTable.TenantId == Guid.Empty || resolvedTable.BranchId == Guid.Empty)
        {
            return Result<Guid>.Failure(new Error("Order.InvalidTable", "Thông tin tenant hoặc chi nhánh của bàn không hợp lệ."));
        }

        // ✅ Check if tenant is locked
        var isTenantLocked = await _tenantClient.IsLockedAsync(resolvedTable.TenantId, ct);
        if (isTenantLocked)
        {
            return Result<Guid>.Failure(new Error("Order.TenantLocked", "Nhà hàng này hiện đang bị khóa. Không thể tạo đơn hàng."));
        }

        // 1. Tạo đơn hàng (Order Header)
        var order = new Domain.Entities.Order
        {
            Id = Guid.NewGuid(),
            TableId = request.TableId,
            TableName = string.IsNullOrWhiteSpace(resolvedTable.TableName) ? "Mang về" : resolvedTable.TableName.Trim(),
            TenantId = resolvedTable.TenantId,
            BranchId = resolvedTable.BranchId,
            Status = OrderStatus.Pending, // Mới đặt, chờ bếp
            OrderDate = DateTime.UtcNow,
            TotalAmount = 0 // Sẽ cộng dồn bên dưới
        };

        // 2. Duyệt qua từng món khách chọn
        foreach (var itemDto in request.Items)
        {
            // 3. QUAN TRỌNG: Gọi Catalog Service để lấy thông tin món ăn mới nhất
            // ✅ Pass tenantId để Catalog Service biết filter theo tenant nào
            // Giả sử hàm GetProductAsync trả về { Id, Name, Price, ImageUrl }
            var productInfo = await _catalogClient.GetProductAsync(itemDto.ProductId, resolvedTable.TenantId, ct);

            if (productInfo == null)
            {
                return Result<Guid>.Failure(new Error("Order.ProductNotFound", $"Món ăn với ID {itemDto.ProductId} không tồn tại hoặc đã bị xóa."));
            }

            // 4. Tạo OrderItem với giá từ Database (Backend), không phải từ Frontend
            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = itemDto.ProductId,
                ProductName = productInfo.Name, // Lưu cứng tên tại thời điểm đặt
                UnitPrice = productInfo.Price,  // Lưu cứng giá tại thời điểm đặt
                Quantity = itemDto.Quantity,
                Note = itemDto.Note,
                TotalPrice = productInfo.Price * itemDto.Quantity,
                TenantId = resolvedTable.TenantId
            };

            order.Items.Add(orderItem);
            order.TotalAmount += orderItem.TotalPrice;
        }

        // 5. Lưu vào Database
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(order.Id);
    }
}