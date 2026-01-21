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
    public DbSet<Domain.Entities.Table> Tables { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Domain.Entities.Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.BranchId); // Index mới cho Chi nhánh
            entity.HasIndex(e => e.BookingTime); // Index để query theo ngày

            entity.Property(e => e.GuestName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>();
        });
    }
}