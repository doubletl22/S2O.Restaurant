using MediatR; // Cần thiết cho IPublisher
using S2O.Payment.App.Abstractions;
using S2O.Payment.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.IntegrationEvents; // Reference event vừa tạo
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Payment.App.Features.Payments.Commands;

public class CreatePaymentHandler : ICommandHandler<CreatePaymentCommand, Guid>
{
    private readonly IPaymentDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IPublisher _publisher; // Inject Publisher

    public CreatePaymentHandler(
        IPaymentDbContext context,
        ITenantContext tenantContext,
        IPublisher publisher)
    {
        _context = context;
        _tenantContext = tenantContext;
        _publisher = publisher;
    }

    public async Task<Result<Guid>> Handle(CreatePaymentCommand request, CancellationToken ct)
    {
        // 1. Validate
        if (_tenantContext.TenantId == null)
            return Result<Guid>.Failure(new Error("Payment.TenantMissing", "Lỗi xác thực Tenant."));

        if (request.Amount <= 0)
            return Result<Guid>.Failure(new Error("Payment.InvalidAmount", "Số tiền không hợp lệ."));

        // 2. Tạo Transaction
        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            OrderId = request.OrderId,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            Status = PaymentStatus.Pending,
            Currency = "VND",
            CreatedAtUtc = DateTime.UtcNow
        };

        // 3. Xử lý thanh toán Tiền mặt (Cash) -> Thành công ngay
        if (request.PaymentMethod == "Cash")
        {
            transaction.Status = PaymentStatus.Success;
        }

        // 4. Lưu DB
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync(ct);

        // 5. [QUAN TRỌNG] Bắn sự kiện nếu thành công
        if (transaction.Status == PaymentStatus.Success)
        {
            var evt = new PaymentSucceededEvent(
                transaction.OrderId,
                transaction.Amount,
                transaction.PaymentMethod,
                DateTime.UtcNow
            );

            // Order Service sẽ lắng nghe sự kiện này
            await _publisher.Publish(evt, ct);
        }

        return Result<Guid>.Success(transaction.Id);
    }
}