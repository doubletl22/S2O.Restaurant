using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Shared.Kernel.Results;
// Đặt biệt danh để tránh trùng với namespace S2O.Order
using OrderEntity = S2O.Order.Domain.Entities.Order;

namespace S2O.Order.App.Features.Orders.Queries;

// Thay vì dùng Order, hãy dùng OrderEntity ở mọi nơi đóng vai trò là kiểu dữ liệu
public record GetOrdersQuery(DateTime? FromDate = null) : IRequest<Result<List<OrderEntity>>>;
public class GetOrdersHandler : IRequestHandler<GetOrdersQuery, Result<List<OrderEntity>>>
{
    private readonly IOrderDbContext _context;

    public GetOrdersHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<OrderEntity>>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<List<OrderEntity>>.Success(orders);
    }
}