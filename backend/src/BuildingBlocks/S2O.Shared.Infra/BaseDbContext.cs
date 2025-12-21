using Microsoft.EntityFrameworkCore;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Kernel.Primitives;

namespace S2O.Shared.Infra;

public abstract class BaseDbContext : DbContext
{
    private readonly AuditableEntityInterceptor _auditableEntityInterceptor;

    // Constructor nhận options và interceptor từ DI
    protected BaseDbContext(
        DbContextOptions options,
        AuditableEntityInterceptor auditableEntityInterceptor)
        : base(options)
    {
        _auditableEntityInterceptor = auditableEntityInterceptor;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Tự động gắn Interceptor vào mọi kết nối DB
        optionsBuilder.AddInterceptors(_auditableEntityInterceptor);
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tự động tìm cấu hình (IEntityTypeConfiguration) trong assembly con (Service.Infra)
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        base.OnModelCreating(modelBuilder);
    }
}