using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Authentication;
using S2O.Identity.Infra.Persistence;
using S2O.Shared.Infra; // Namespace chứa AddSharedInfrastructure
using S2O.Shared.Infra.Interceptors;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- 1. ĐĂNG KÝ CÁC DỊCH VỤ CƠ BẢN (BuildingBlocks) ---
builder.Services.AddSharedInfrastructure();
// Lưu ý: Đảm bảo AddSharedInfrastructure() trong Infra đã có services.AddHttpContextAccessor();

// --- 2. ĐĂNG KÝ CONTROLLERS (Sửa lỗi bạn vừa gặp) ---
builder.Services.AddControllers();

// --- 3. CẤU HÌNH DATABASE & INTERCEPTORS ---
builder.Services.AddDbContext<AuthDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});

// --- 4. CẤU HÌNH IDENTITY ---
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

// --- 5. CẤU HÌNH AUTHENTICATION & AUTHORIZATION ---
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
    };
});

builder.Services.AddAuthorization(); // Đăng ký dịch vụ Authorization

// --- 6. ĐĂNG KÝ APPLICATION SERVICES ---
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ITokenProvider, TokenProvider>();
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(S2O.Identity.App.Features.Login.LoginCommand).Assembly));

// --- 7. SWAGGER ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "S2O Identity API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
        { new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
          }, Array.Empty<string>() }
    });
});

var app = builder.Build();

// --- 8. CẤU HÌNH MIDDLEWARE PIPELINE ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseTenantResolver(); // Kích hoạt nếu bạn đã dời Middleware vào Infra

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); // Sẽ chạy bình thường vì đã có AddControllers() ở trên

// --- 9. SEED DATA ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<AuthDbContext>();

        // BƯỚC 1: Tạo bảng (Nếu chưa có)
        logger.LogInformation("Đang kiểm tra và cập nhật Database (Migration)...");
        await context.Database.MigrateAsync();

        // BƯỚC 2: Seed dữ liệu (Sau khi đã có bảng)
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        logger.LogInformation("Đang Seed dữ liệu mẫu...");
        await IdentityDataSeeder.SeedAsync(userManager, roleManager);

        logger.LogInformation("Hoàn tất chuẩn bị Database.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Lỗi nghiêm trọng trong quá trình khởi tạo Database.");
    }
}

app.Run();