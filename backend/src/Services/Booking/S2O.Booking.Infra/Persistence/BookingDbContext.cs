using Microsoft.EntityFrameworkCore;
using S2O.Booking.App.Abstractions;
using S2O.Shared.Infra.Data; // BaseDbContext
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Booking.Infra.Persistence;

public class BookingDbContext : BaseDbContext, IBookingDbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options, ITenantContext tenantContext)
        : base(options, tenantContext)
    {
    }

    public DbSet<Domain.Entities.Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Domain.Entities.Booking>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Index TenantId để query nhanh
            entity.HasIndex(e => e.TenantId);

            // Validate dữ liệu cơ bản
            entity.Property(e => e.GuestName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>(); // Lưu Enum dạng string cho dễ đọc trong DB
        });
    }
}