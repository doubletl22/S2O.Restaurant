using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Authentication;
using S2O.Identity.Infra.Persistence;
using S2O.Shared.Extensions; // Middleware cho Multi-tenant
using S2O.Shared.Implementations;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Interfaces;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình PostgreSQL từ appsettings.json
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Cấu hình ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

// 3. Đăng ký MediatR (Lấy assembly từ lớp App để quét các Handler)
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(S2O.Identity.App.Features.Login.LoginCommand).Assembly));

// 4. Đăng ký các dịch vụ nội bộ
builder.Services.AddScoped<ITokenProvider, TokenProvider>();

// 5. Cấu hình Authentication & JWT
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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddScoped<UpdateAuditableEntitiesInterceptor>();

var app = builder.Build();

// Cấu hình Pipeline cho Microservice
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseTenantResolver(); // Nhận diện TenantId từ Header hoặc Token
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
    await IdentityDataSeeder.SeedAsync(userManager, roleManager);
}

app.Run();