using S2O.Shared.Kernel.Abstractions;

namespace S2O.Booking.App.Features.Bookings.Commands;

public record CreateBookingCommand(
    Guid BranchId,
    Guid? TableId,
    string GuestName,
    string PhoneNumber,
    DateTime BookingTime,
    int PartySize,
    string? Note
) : ICommand<Guid>;