using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Queries;

public class GetGuestOrderStatusHandler : IRequestHandler<GetGuestOrderStatusQuery, Result<StaffOrderDto>>
{
    private readonly IOrderDbContext _context;

    public GetGuestOrderStatusHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StaffOrderDto>> Handle(GetGuestOrderStatusQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .AsNoTracking()
                .IgnoreQueryFilters() // Guest không có token nên TenantContext = null; bỏ qua global tenant filter
                .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
            return Result<StaffOrderDto>.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng này."));

        var orderDto = new StaffOrderDto
        {
            Id = order.Id,
            TableId = order.TableId.HasValue ? order.TableId.Value.ToString() : "Mang về",
            TableName = order.TableName ?? string.Empty,
            Note = order.Note ?? string.Empty,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            Items = order.Items.Select(i => new StaffOrderItemDto
            {
                Id = i.Id.ToString(),
                ProductId = i.ProductId.ToString(),
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Note = i.Note,
                Status = i.Status,
            }).ToList()
        };

        return Result<StaffOrderDto>.Success(orderDto);
    }
}
