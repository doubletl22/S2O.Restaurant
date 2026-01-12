using MediatR;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Booking.App.Features.Bookings.Commands;

// Input từ Frontend
public record CreateBookingCommand(
    string GuestName,
    string PhoneNumber,
    DateTime BookingTime,
    int PartySize,
    string? Note
) : ICommand<Guid>; // Trả về BookingId