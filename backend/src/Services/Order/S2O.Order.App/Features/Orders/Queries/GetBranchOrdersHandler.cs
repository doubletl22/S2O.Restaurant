using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;
using S2O.Shared.Kernel.Results;
// Dùng Alias để tránh lỗi namespace như bài trước
using OrderEntity = S2O.Order.Domain.Entities.Order;

namespace S2O.Order.App.Features.Orders.Queries;

public class GetBranchOrdersHandler : IRequestHandler<GetBranchOrdersQuery, Result<List<StaffOrderDto>>>
{
    private readonly IOrderDbContext _context;

    public GetBranchOrdersHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<StaffOrderDto>>> Handle(GetBranchOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.Items) // Load cả món ăn
            .Where(o => o.BranchId == request.BranchId);

        // Nếu có lọc theo trạng thái (Ví dụ: Chỉ xem đơn Mới)
        if (request.Status.HasValue)
        {
            query = query.Where(o => o.Status == request.Status.Value);
        }

        // Sắp xếp: Đơn mới nhất lên đầu (hoặc đơn cũ nhất lên đầu tùy bếp)
        var orders = await query
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new StaffOrderDto
            {
                Id = o.Id,
                TableId = o.TableId.HasValue ? o.TableId.Value.ToString() : "Mang về",
                TableName = o.TableName ?? "Mang về", // ✅ Map TableName
                OrderNumber = o.OrderNumber, // ✅ Map OrderNumber
                Note = o.Note ?? string.Empty,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                CreatedAtUtc = o.CreatedAtUtc,
                CreatedAt = o.CreatedAtUtc.ToString("yyyy-MM-ddTHH:mm:ss"), // ✅ ISO format
                CreatedOn = o.CreatedAtUtc.ToString("yyyy-MM-ddTHH:mm:ss"), // ✅ Compat
                Items = o.Items.Select(i => new StaffOrderItemDto
                {
                    Id = i.Id.ToString(), // ✅ Item Id
                    ProductId = i.ProductId.ToString(),
                    ProductName = i.ProductName, // ✅ ProductName
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Note = i.Note, // ✅ Item Note
                    Status = i.Status // ✅ Item Status
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return Result<List<StaffOrderDto>>.Success(orders);
    }
}