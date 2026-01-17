using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Queries;

public class GetMyOrdersHandler : IRequestHandler<GetMyOrdersQuery, Result<List<OrderSummaryDto>>>
{
    private readonly IOrderDbContext _context;

    public GetMyOrdersHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<OrderSummaryDto>>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        // Lọc đơn hàng theo UserId (CreatedBy hoặc CustomerId tùy thiết kế DB của bạn)
        // Ở bài trước ta chưa lưu UserId vào bảng Order, lát nữa ta sẽ sửa luồng đặt hàng sau.
        // Tạm thời giả định bảng Order có cột UserId (hoặc CustomerId).

        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.UserId == request.CustomerId) // Lọc theo người dùng
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                CreatedAtUtc = o.CreatedAtUtc,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                ItemCount = o.Items.Count
            })
            .ToListAsync(cancellationToken);

        return Result<List<OrderSummaryDto>>.Success(orders);
    }
}