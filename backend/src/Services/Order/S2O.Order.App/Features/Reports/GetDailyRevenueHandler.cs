using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Shared.Kernel.Results;
using OrderEntity = S2O.Order.Domain.Entities.Order;

public class GetDailyRevenueHandler : IRequestHandler<GetDailyRevenueQuery, Result<decimal>>
{
    private readonly IOrderDbContext _context;

    public GetDailyRevenueHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<decimal>> Handle(GetDailyRevenueQuery request, CancellationToken cancellationToken)
    {
        // Tính tổng tiền các đơn đã "Completed" trong ngày
        var totalRevenue = await _context.Orders
            .Where(o => o.BranchId == request.BranchId)
            .Where(o => o.Status == S2O.Order.Domain.Enums.OrderStatus.Completed)
            .Where(o => o.CreatedAtUtc.Date == request.Date.Date)
            .SumAsync(o => o.TotalAmount, cancellationToken);

        return Result<decimal>.Success(totalRevenue);
    }
}