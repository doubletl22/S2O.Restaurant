using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class AddItemsToGuestOrderHandler : IRequestHandler<AddItemsToGuestOrderCommand, Result>
{
    private readonly IOrderDbContext _context;
    private readonly ICatalogClient _catalogClient;
    private readonly ITableResolverClient _tableResolverClient;

    public AddItemsToGuestOrderHandler(
        IOrderDbContext context,
        ICatalogClient catalogClient,
        ITableResolverClient tableResolverClient)
    {
        _context = context;
        _catalogClient = catalogClient;
        _tableResolverClient = tableResolverClient;
    }

    public async Task<Result> Handle(AddItemsToGuestOrderCommand request, CancellationToken ct)
    {
        var order = await _context.Orders
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, ct);

        if (order == null)
            return Result.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng."));

        if (order.Status == OrderStatus.Completed ||
            order.Status == OrderStatus.Cancelled ||
            order.Status == OrderStatus.Paid)
            return Result.Failure(new Error("Order.Closed", "Đơn hàng đã đóng, không thể thêm món."));

        if (!order.TableId.HasValue)
            return Result.Failure(new Error("Order.InvalidTable", "Đơn hàng không gắn với bàn hợp lệ."));

        var resolvedTable = await _tableResolverClient.ResolveAsync(order.TableId.Value, ct);
        if (resolvedTable == null)
            return Result.Failure(new Error("Order.InvalidTable", "Không xác thực được bàn cho đơn hàng này."));

        if (order.TenantId != resolvedTable.TenantId || order.BranchId != resolvedTable.BranchId)
            return Result.Failure(new Error("Order.ScopeMismatch", "Thông tin đơn hàng không còn khớp với bàn hiện tại."));

        if (request.TenantId != Guid.Empty && order.TenantId.HasValue && request.TenantId != order.TenantId.Value)
            return Result.Failure(new Error("Order.ScopeMismatch", "TenantId không hợp lệ."));

        foreach (var itemDto in request.Items)
        {
            if (itemDto.Quantity <= 0)
                return Result.Failure(new Error("Order.InvalidQuantity", "Số lượng món phải lớn hơn 0."));

            var productInfo = await _catalogClient.GetProductAsync(itemDto.ProductId, order.TenantId, ct);

            if (productInfo == null)
                return Result.Failure(new Error("Order.ProductNotFound",
                    $"Món ăn với ID {itemDto.ProductId} không tồn tại hoặc đã bị xóa."));

            var normalizedNote = string.IsNullOrWhiteSpace(itemDto.Note) ? null : itemDto.Note.Trim();
            var existingItem = await _context.OrderItems
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(i =>
                    i.OrderId == order.Id &&
                    i.ProductId == itemDto.ProductId &&
                    (i.Note ?? string.Empty).Trim() == (normalizedNote ?? string.Empty), ct);

            if (existingItem != null)
            {
                existingItem.ProductName = productInfo.Name;
                existingItem.UnitPrice = productInfo.Price;
                existingItem.Quantity += itemDto.Quantity;
                existingItem.TotalPrice = existingItem.UnitPrice * existingItem.Quantity;
                existingItem.Status = OrderStatus.Pending;
                order.TotalAmount += productInfo.Price * itemDto.Quantity;
                continue;
            }

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = itemDto.ProductId,
                ProductName = productInfo.Name,
                UnitPrice = productInfo.Price,
                Quantity = itemDto.Quantity,
                Note = normalizedNote,
                TotalPrice = productInfo.Price * itemDto.Quantity,
                Status = OrderStatus.Pending,
                TenantId = order.TenantId
            };

            // Add explicitly to DbSet to avoid collection tracking conflicts on existing items.
            _context.OrderItems.Add(orderItem);
            order.TotalAmount += orderItem.TotalPrice;
        }

        // Guest added more items, so the order must go back to manager approval queue.
        order.Status = OrderStatus.Pending;

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
