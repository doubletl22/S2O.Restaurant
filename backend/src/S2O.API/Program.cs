using S2O.Domain.Interfaces;
using S2O.Infrastructure.Services;
using S2O.API.Middlewares;
// ... (Các using khác)

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký Dịch vụ Multi-tenant (Scoped)
builder.Services.AddScoped<ITenantProvider, TenantProvider>();

// ... (Các cấu hình khác: DBContext, Controllers, Swagger)

var app = builder.Build();

// 2. Áp dụng Middleware đầu tiên trong Pipeline
// Middleware này phải chạy TRƯỚC khi Entity Framework (DbContext) được tạo ra.
app.UseMiddleware<TenantIdentificationMiddleware>();

// ... (app.UseRouting, app.UseAuthentication, app.UseAuthorization, app.MapControllers)

app.Run();