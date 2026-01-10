using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Authentication;
using S2O.Identity.Infra.Persistence;
using S2O.Shared.Infra; // Namespace mới cho Infrastructure
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Kernel.Interfaces; // Namespace mới cho Interfaces
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký các dịch vụ chung từ BuildingBlocks (Thay thế cho các đăng ký lẻ tẻ)
builder.Services.AddSharedInfrastructure();

// 2. Đăng ký Database với Interceptor
builder.Services.AddDbContext<AuthDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});

// 3. Cấu hình Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

// 4. MediatR và các App Services
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ITokenProvider, TokenProvider>();
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(S2O.Identity.App.Features.Login.LoginCommand).Assembly));

// ... (Phần cấu hình Authentication và Swagger giữ nguyên)

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseTenantResolver(); // Nếu middleware này đã chuyển vào Infra, hãy cập nhật namespace. 
// Tạm thời comment nếu bạn chưa dời file TenantResolverMiddleware.cs sang project mới.

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seeding Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
    await IdentityDataSeeder.SeedAsync(userManager, roleManager);
}

app.Run();