using S2O.Payment.App.Abstractions;
using S2O.Payment.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Payment.App.Features.Payments.Commands;

public class CreatePaymentHandler : ICommandHandler<CreatePaymentCommand, Guid>
{
    private readonly IPaymentDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CreatePaymentHandler(IPaymentDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(CreatePaymentCommand request, CancellationToken ct)
    {
        // 1. Validate Tenant
        if (_tenantContext.TenantId == null)
            return Result<Guid>.Failure(new Error("Payment.TenantMissing", "Không xác định được nhà hàng."));

        // 2. Tạo Transaction (Trạng thái mặc định là Pending)
        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            OrderId = request.OrderId,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            Status = PaymentStatus.Pending,
            Currency = "VND"
        };

        // 3. Nếu là Tiền mặt (Cash), ta có thể cho Success luôn (hoặc chờ xác nhận sau)
        // Tạm thời để Pending, chờ thu ngân xác nhận "Đã nhận tiền".
        if (request.PaymentMethod == "Cash")
        {
            transaction.Status = PaymentStatus.Success; // Giả sử thu tiền mặt là xong luôn
        }

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(transaction.Id);
    }
}