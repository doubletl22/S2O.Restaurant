using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class UpdateOrderHandler : IRequestHandler<UpdateOrderCommand, Result>
{
    private readonly IOrderDbContext _context;

    public UpdateOrderHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm đơn hàng (Kèm theo Items để xóa)
        var order = await _context.Orders
            .Include(o => o.Items) // <-- Quan trọng: Phải Load Items lên mới sửa được
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null) return Result.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng."));

        // 2. Validate trạng thái
        if (order.Status != OrderStatus.Pending)
        {
            return Result.Failure(new Error("Order.CannotUpdate", "Đơn hàng đã vào bếp, vui lòng gọi nhân viên để đổi món."));
        }

        // 3. Xóa sạch món cũ (Cách đơn giản nhất)
        _context.OrderItems.RemoveRange(order.Items);
        order.Items.Clear();

        // 4. Thêm món mới & Tính lại tổng tiền
        decimal totalAmount = 0;
        foreach (var item in request.NewItems)
        {
            var newItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = 50000, // TODO: Vẫn là Hardcode, thực tế nên gọi Catalog check giá
                // Note = item.Note
            };
            totalAmount += newItem.UnitPrice * newItem.Quantity;
            order.Items.Add(newItem);
        }

        // 5. Cập nhật thông tin chung
        order.TotalAmount = totalAmount;
        if (!string.IsNullOrEmpty(request.NewNote))
        {
            order.Note = request.NewNote;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}