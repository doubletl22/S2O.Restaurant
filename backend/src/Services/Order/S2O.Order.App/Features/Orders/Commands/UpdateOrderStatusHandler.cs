using S2O.Order.App.Abstractions;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;
using S2O.Shared.Kernel.Interfaces; 

namespace S2O.Order.App.Features.Orders.Commands;

public class UpdateOrderStatusHandler : ICommandHandler<UpdateOrderStatusCommand, bool>
{
    private readonly IOrderDbContext _context;

    public UpdateOrderStatusHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateOrderStatusCommand request, CancellationToken ct)
    {
        var order = await _context.Orders.FindAsync(new object[] { request.OrderId }, ct);

        if (order == null)
        {
            return Result<bool>.Failure(new Error("Order.NotFound", "Không tìm thấy đơn hàng."));
        }

        order.Status = request.NewStatus;
        order.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}