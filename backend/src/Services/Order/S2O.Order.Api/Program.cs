using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Infra.Services;
using S2O.Kernel.Interfaces;
using S2O.Order.Api.Hubs;
using S2O.Order.Api.Services;
using S2O.Order.App.Abstractions;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.Infra.ExternalServices;
using S2O.Order.Infra.Persistence;
using S2O.Shared.Infra;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Cấu hình Database & Interceptor ---
builder.Services.AddScoped<UpdateAuditableEntitiesInterceptor>();
builder.Services.AddDbContext<OrderDbContext>((sp, options) => {
    var interceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});
// Đăng ký Interface để Tầng App không phụ thuộc trực tiếp vào Infra
builder.Services.AddScoped<IOrderDbContext>(sp => sp.GetRequiredService<OrderDbContext>());

// --- 2. Cấu hình Authentication (Xác thực JWT) ---
// Phải khớp với Identity và Catalog Service
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
// --- 3. Cấu hình HttpClient gọi sang Catalog Service ---
// Lâm lưu ý: ExternalServices:CatalogUrl lấy từ appsettings.json
builder.Services.AddHttpClient<ICatalogClient, CatalogClient>(client => {
    client.BaseAddress = new Uri(builder.Configuration["ExternalServices:CatalogUrl"]!);
});

// --- 4. Cấu hình Multi-tenant & User Context ---
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantContext, TenantContext>();
builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddScoped<IUserContext, UserContext>();
// --- 5. Cấu hình MediatR ---
// Đăng ký các Handler nằm trong project App
builder.Services.AddMediatR(cfg =>
        cfg.RegisterServicesFromAssembly(typeof(S2O.Order.App.Features.Orders.Commands.PlaceGuestOrderCommand).Assembly));
// --- 6. Các dịch vụ API cơ bản ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    // Cấu hình nút Authorize trên Swagger để dán Token vào test
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập Token từ Identity Service"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddSignalR();
builder.Services.AddScoped<IOrderNotifier, OrderNotifier>();
builder.Services.AddTransient<AuthenticationDelegatingHandler>();
builder.Services.AddHttpClient<ICatalogClient, CatalogClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ExternalServices:CatalogUrl"]!);
})
.AddHttpMessageHandler<AuthenticationDelegatingHandler>();

var app = builder.Build();

// --- 7. Middleware Pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    if (context.Database.GetPendingMigrations().Any())
    {
        context.Database.Migrate();
    }
}
app.UseHttpsRedirection();
app.MapHub<OrderHub>("/hubs/orders");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();