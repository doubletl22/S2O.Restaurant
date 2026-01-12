using S2O.Booking.App.Abstractions;
using S2O.Booking.Domain.Entities; // Alias
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Booking.App.Features.Bookings.Commands;

public class CreateBookingHandler : ICommandHandler<CreateBookingCommand, Guid>
{
    private readonly IBookingDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CreateBookingHandler(IBookingDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(CreateBookingCommand request, CancellationToken ct)
    {
        // 1. Validate cơ bản
        if (_tenantContext.TenantId == null)
            return Result<Guid>.Failure(new Error("Booking.TenantMissing", "Không xác định được nhà hàng."));

        if (request.BookingTime < DateTime.UtcNow)
            return Result<Guid>.Failure(new Error("Booking.InvalidTime", "Thời gian đặt bàn phải ở tương lai."));

        if (request.PartySize <= 0)
            return Result<Guid>.Failure(new Error("Booking.InvalidSize", "Số lượng khách phải lớn hơn 0."));

        // 2. Tạo Entity
        var booking = new Domain.Entities.Booking
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId.Value,
            GuestName = request.GuestName,
            PhoneNumber = request.PhoneNumber,
            BookingTime = request.BookingTime,
            PartySize = request.PartySize,
            Note = request.Note,
            Status = BookingStatus.Pending // Mặc định chờ duyệt
        };

        // 3. Lưu DB
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(booking.Id);
    }
}