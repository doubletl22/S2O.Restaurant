using MediatR;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Entities;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class RequestBillHandler : IRequestHandler<RequestBillCommand, Result<bool>>
{
    private readonly IOrderDbContext _context;

    public RequestBillHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(RequestBillCommand request, CancellationToken ct)
    {
        // Cách tối giản để staff/owner nhìn thấy “yêu cầu thanh toán” ngay trong luồng orders:
        // Tạo một Order "system" tổng tiền 0 với note.
        var order = new Domain.Entities.Order
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            TableId = request.TableId,
            Status = OrderStatus.Pending,
            Note = "[REQUEST_BILL] Khách yêu cầu thanh toán",
            OrderDate = DateTime.UtcNow,
            TotalAmount = 0
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}
