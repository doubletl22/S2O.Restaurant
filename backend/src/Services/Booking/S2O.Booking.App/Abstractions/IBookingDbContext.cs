using Microsoft.EntityFrameworkCore;
using S2O.Booking.Domain.Entities; // Alias nếu trùng tên

namespace S2O.Booking.App.Abstractions;

public interface IBookingDbContext
{
    DbSet<Domain.Entities.Booking> Bookings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}