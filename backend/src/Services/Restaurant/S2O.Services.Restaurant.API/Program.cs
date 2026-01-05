using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using S2O.Services.Restaurant.Application.Services;
using S2O.Services.Restaurant.Infrastructure.Data;
using S2O.Services.Restaurant.Application.Interfaces;
using S2O.Services.Restaurant.Infrastructure.Repositories;
using S2O.Shared.Infra;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// 1. ĐĂNG KÝ SERVICES (DEPENDENCY INJECTION)
// =========================================================================
builder.Services.AddScoped<IMenuRepository, MenuRepository>(); // <-- THÊM DÒNG NÀY
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// --- A. Cấu hình Swagger có nút Authorize (JWT) ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "S2O Restaurant Service API", Version = "v1" });

    // Định nghĩa Security Scheme (Bearer)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// --- B. Đăng ký Shared Infrastructure (DbContext, MassTransit, Logging...) ---
// Hàm này nằm trong S2O.Shared.Infra, giúp code gọn gàng
builder.Services.AddSharedInfra<RestaurantDbContext>(builder.Configuration);

// --- C. Đăng ký Application Services (Business Logic) ---
// Đây là nơi bạn đăng ký các Service mình vừa viết
builder.Services.AddScoped<IMenuService, MenuService>();
// Nếu có thêm Service khác (ví dụ RestaurantInfoService), đăng ký tiếp ở đây
// builder.Services.AddScoped<IRestaurantInfoService, RestaurantInfoService>();

// --- D. Cấu hình Authentication (Xác thực JWT) ---
// Đọc config từ appsettings.json
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

// --- E. Cấu hình CORS (Cho phép Frontend gọi API) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// =========================================================================
// 2. CẤU HÌNH HTTP REQUEST PIPELINE
// =========================================================================

// --- A. Auto Migration (Tự động tạo DB khi chạy App) ---
// Đoạn này giúp bạn không cần gõ lệnh 'dotnet ef database update' thủ công
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
    // context.Database.Migrate(); // Bỏ comment dòng này nếu muốn tự động chạy migration
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Có thể tắt nếu chạy trong Docker nội bộ

app.UseCors("AllowAll");

// Thứ tự quan trọng: AuthN (Xác thực) -> AuthZ (Phân quyền)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();