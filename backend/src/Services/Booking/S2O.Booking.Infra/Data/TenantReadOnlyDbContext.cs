using Microsoft.EntityFrameworkCore;
using S2O.Booking.Domain.Entities; // Tạm dùng namespace này hoặc tạo class Table riêng

namespace S2O.Booking.Infra.Data;

// Context này CHỈ dùng để kết nối sang Tenant DB
public class TenantReadOnlyDbContext : DbContext
{
    public TenantReadOnlyDbContext(DbContextOptions<TenantReadOnlyDbContext> options) : base(options)
    {
    }

    // Map vào bảng "Tables" của Tenant
    public DbSet<TenantTable> Tables { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Quan trọng: Phải map đúng tên bảng bên Tenant DB
        modelBuilder.Entity<TenantTable>().ToTable("Tables");

        // Đặt Key nếu cần
        modelBuilder.Entity<TenantTable>().HasKey(t => t.Id);
    }
}

// Class đại diện cho bảng Table bên Tenant (Chỉ cần các trường cần dùng)
public class TenantTable
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    //public string Name { get; set; } = default;
    public int Capacity { get; set; }
    // Không cần map hết, chỉ cần mấy cái này để validate
}