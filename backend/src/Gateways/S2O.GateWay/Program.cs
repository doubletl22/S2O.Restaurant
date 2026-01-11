using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using S2O.Shared.Infra; // Nếu bạn dùng Shared Infrastructure cho Gateway
using System.Text;

// Program.cs
var builder = WebApplication.CreateBuilder(args);

// 1. Phải nạp cấu hình Ocelot trước
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// 2. Đăng ký Authentication (Dùng trực tiếp ở Gateway để Ocelot dễ nhận diện)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer("Bearer", options => // Đặt tên rõ ràng là "Bearer"
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
    };
});

// 3. Đăng ký Ocelot
builder.Services.AddOcelot(builder.Configuration);

// NẾU BẠN DÙNG SHARED: Hãy vào Shared xóa đoạn AddAuthentication trong đó 
// để tránh lỗi "Scheme already exists" đã gặp lúc trước.
builder.Services.AddSharedInfrastructure();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// Ocelot chạy ở cuối
await app.UseOcelot();

app.Run();