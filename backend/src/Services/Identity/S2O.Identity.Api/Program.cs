using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Authentication;
using S2O.Identity.Infra.Persistence;
using MassTransit;
using S2O.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Infra; // Chứa AddSharedInfrastructure
using S2O.Shared.Infra.Interceptors;

var builder = WebApplication.CreateBuilder(args);

// 1. Controller & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "S2O Identity API", Version = "v1" });

    // Config nút Authorize trên Swagger
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

// 2. Database
builder.Services.AddDbContext<AuthDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});
builder.Services.AddScoped<IAuthDbContext>(provider => provider.GetRequiredService<AuthDbContext>());

// 3. Identity Core (User, Role)
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

// 4. Shared Infrastructure (Nó sẽ tự lo việc Config JWT/Bearer cho bạn)
builder.Services.AddSharedInfrastructure(builder.Configuration);

// 5. Identity Services
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>(); // (Lưu ý: Shared cũng có UserContext, bạn nên kiểm tra xem có cần cái này không)
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ITokenProvider, TokenProvider>();
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(S2O.Identity.App.Features.Login.LoginCommand).Assembly));
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitHost = builder.Configuration["MessageBroker:Host"] ?? "localhost";

        cfg.Host(rabbitHost, "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ConfigureEndpoints(context);
    });
});

// 6. Config Firebase
if (File.Exists("firebase-adminsdk.json"))
{
    FirebaseApp.Create(new AppOptions
    {
        Credential = GoogleCredential.FromFile("firebase-adminsdk.json")
    });
}
else
{
    Console.WriteLine("⚠️ Cảnh báo: Không tìm thấy firebase-adminsdk.json");
}

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        // 1. Lấy các Service cần thiết từ Container (Khớp với tham số trong Seeder của bạn)
        var context = services.GetRequiredService<AuthDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        // 2. Chạy Migration tự động (Tạo bảng trước khi Seed)
        // Kiểm tra xem có bản cập nhật DB nào chưa chạy không
        if (context.Database.GetPendingMigrations().Any())
        {
            logger.LogInformation("Đang cập nhật Database (Migration)...");
            await context.Database.MigrateAsync();
        }

        // 3. Gọi hàm Seeder của bạn
        logger.LogInformation("Đang khởi tạo dữ liệu mẫu (Seeding)...");
        await IdentityDataSeeder.SeedAsync(userManager, roleManager, context);

        logger.LogInformation("✅ Khởi tạo dữ liệu thành công!");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ Lỗi xảy ra trong quá trình Migration/Seeding.");
    }
}
// Configure Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 7. Migration & Seeding Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // Lưu ý: Thay 'TenantsDbContext' bằng tên DbContext tương ứng của Service đó
        // Ví dụ: CatalogDbContext, OrderDbContext...
        var context = services.GetRequiredService<S2O.Identity.Infra.Persistence.AuthDbContext>();

        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Lỗi Migration: {ex.Message}");
    }
}

app.Run();