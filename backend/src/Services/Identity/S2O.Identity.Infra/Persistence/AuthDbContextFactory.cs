using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using S2O.Shared.Interfaces;

namespace S2O.Identity.Infra.Persistence;

public class AuthDbContextFactory : IDesignTimeDbContextFactory<AuthDbContext>
{
    public AuthDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AuthDbContext>();

        // Chuỗi kết nối này chỉ dùng để tạo Migration, không quan trọng bảo mật ở đây
        optionsBuilder.UseNpgsql("Host=localhost;Database=S2O_Identity_Db;Username=postgres;Password=admin123");

        // Truyền một bản mock/giả của ITenantContext cho lúc Design Time
        return new AuthDbContext(optionsBuilder.Options, new DesignTimeTenantContext());
    }
}

// Lớp giả lập để EF CLI vượt qua bước kiểm tra constructor
internal class DesignTimeTenantContext : ITenantContext
{
    public Guid? TenantId { get; set; } = Guid.Empty;
    public string? Email { get; set; } = "design-time@s2o.com";
}