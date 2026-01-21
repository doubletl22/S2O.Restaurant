using S2O.Booking.App.Abstractions; // Using Interface vừa tạo
using S2O.Booking.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using Microsoft.EntityFrameworkCore; // Để dùng AnyAsync

namespace S2O.Booking.App.Features.Bookings.Commands;

public class CreateBookingHandler : ICommandHandler<CreateBookingCommand, Guid>
{
    private readonly IBookingDbContext _bookingContext;
    private readonly ITenantContext _tenantContext;
    private readonly ITenantTableChecker _tableChecker; // [THAY ĐỔI]: Dùng Interface

    public CreateBookingHandler(
        IBookingDbContext bookingContext,
        ITenantContext tenantContext,
        ITenantTableChecker tableChecker) // Inject Interface
    {
        _bookingContext = bookingContext;
        _tenantContext = tenantContext;
        _tableChecker = tableChecker;
    }

    public async Task<Result<Guid>> Handle(CreateBookingCommand request, CancellationToken ct)
    {
        // 1. Validate cơ bản
        if (_tenantContext.TenantId == null)
            return Result<Guid>.Failure(new Error("Booking.TenantMissing", "Không xác định được nhà hàng."));

        if (request.BranchId == Guid.Empty)
            return Result<Guid>.Failure(new Error("Booking.BranchMissing", "Vui lòng chọn chi nhánh."));

        // 2. Validate Bàn (Dùng Interface cầu nối)
        if (request.TableId.HasValue)
        {
            // Gọi sang Infra để check
            var tableCapacity = await _tableChecker.GetTableCapacityAsync(request.TableId.Value, request.BranchId);

            if (tableCapacity == null)
            {
                return Result<Guid>.Failure(new Error("Booking.TableNotFound", "Bàn không tồn tại hoặc sai chi nhánh (Check Tenant DB)."));
            }

            if (tableCapacity < request.PartySize)
            {
                // Warning sức chứa (nếu cần)
            }

            // 3. Check trùng lịch (Booking DB)
            bool isTableBooked = await _bookingContext.Bookings.AnyAsync(b =>
                b.TableId == request.TableId
                && b.Status != BookingStatus.Cancelled
                && b.BookingTime <= request.BookingTime.AddHours(2)
                && b.BookingTime >= request.BookingTime.AddHours(-2), ct);

            if (isTableBooked)
            {
                return Result<Guid>.Failure(new Error("Booking.TableBusy", "Bàn này đã có người đặt."));
            }
        }

        // 4. Lưu Booking
        var booking = new Booking.Domain.Entities.Booking
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId.Value,
            BranchId = request.BranchId,
            TableId = request.TableId,
            GuestName = request.GuestName,
            PhoneNumber = request.PhoneNumber,
            BookingTime = request.BookingTime,
            PartySize = request.PartySize,
            Note = request.Note,
            Status = BookingStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        _bookingContext.Bookings.Add(booking);
        await _bookingContext.SaveChangesAsync(ct);

        return Result<Guid>.Success(booking.Id);
    }
}