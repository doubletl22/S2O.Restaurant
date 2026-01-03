using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Services.Identity.Domain.Entities;
// using S2O.Shared.Infra.Interceptors; // Namespace chứa Interceptor

namespace S2O.Services.Identity.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext // Nếu dùng IdentityUser mặc định
    {
        // 1. Khai báo Interceptor
        private readonly ISaveChangesInterceptor _auditableEntityInterceptor;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            ISaveChangesInterceptor auditableEntityInterceptor) : base(options) // 2. Inject vào constructor
        {
            _auditableEntityInterceptor = auditableEntityInterceptor;
        }

        public DbSet<User> AppUsers { get; set; } // Tránh trùng tên với bảng Users của Identity
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // 3. Đăng ký Interceptor vào Pipeline của EF Core
            optionsBuilder.AddInterceptors(_auditableEntityInterceptor);
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Config User
            builder.Entity<User>(entity =>
            {
                entity.ToTable("AppUsers");
                entity.HasKey(u => u.Id);
                // Các cấu hình khác...
            });
        }
    }
}