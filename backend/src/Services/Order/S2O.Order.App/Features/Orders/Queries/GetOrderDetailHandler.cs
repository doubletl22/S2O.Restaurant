using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;
using S2O.Shared.Kernel.Results;

// Dùng Alias để tránh xung đột tên với Namespace S2O.Order
using OrderEntity = S2O.Order.Domain.Entities.Order;

namespace S2O.Order.App.Features.Orders.Queries;

public class GetOrderDetailHandler : IRequestHandler<GetOrderDetailQuery, Result<StaffOrderDto>>
{
    private readonly IOrderDbContext _context;

    public GetOrderDetailHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StaffOrderDto>> Handle(GetOrderDetailQuery request, CancellationToken cancellationToken)
    {
        // 1. Tìm đơn hàng trong DB
        var order = await _context.Orders
            .AsNoTracking() // Tối ưu hiệu năng cho thao tác chỉ đọc
            .Include(o => o.Items) // Quan trọng: Phải load cả danh sách món ăn
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        // 2. Kiểm tra tồn tại
        if (order == null)
        {
            return Result<StaffOrderDto>.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng này."));
        }

        // 3. Kiểm tra Bảo mật (Security Check)
        // Nhân viên chi nhánh A không được phép xem đơn của chi nhánh B
        if (order.BranchId != request.BranchId)
        {
            return Result<StaffOrderDto>.Failure(new Error("Security.AccessDenied", "Bạn không có quyền truy cập đơn hàng của chi nhánh khác."));
        }

        // 4. Map sang DTO (Giống hệt logic bên GetBranchOrdersHandler)
        var orderDto = new StaffOrderDto
        {
            Id = order.Id,

            // Xử lý Null an toàn
            TableId = order.TableId.HasValue ? order.TableId.Value.ToString() : "Mang về",
            Note = order.Note ?? string.Empty,

            TotalAmount = order.TotalAmount,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,

            // Map danh sách món
            Items = order.Items.Select(i => new StaffOrderItemDto
            {
                ProductId = i.ProductId.ToString(),
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        return Result<StaffOrderDto>.Success(orderDto);
    }
}