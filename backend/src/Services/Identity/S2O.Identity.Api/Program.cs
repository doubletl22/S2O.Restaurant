using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Authentication;
using S2O.Identity.Infra.Persistence;
using S2O.Infra.Services;
using S2O.Kernel.Interfaces;
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

// --- [ĐÃ XÓA] ĐOẠN CODE GÂY LỖI TRÙNG LẶP JWT TẠI ĐÂY ---

// 4. Shared Infrastructure (Nó sẽ tự lo việc Config JWT/Bearer cho bạn)
builder.Services.AddSharedInfrastructure(builder.Configuration);

// 5. Identity Services
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>(); // (Lưu ý: Shared cũng có UserContext, bạn nên kiểm tra xem có cần cái này không)
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ITokenProvider, TokenProvider>();
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(S2O.Identity.App.Features.Login.LoginCommand).Assembly));

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
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<AuthDbContext>();

        logger.LogInformation("Identity Service: Đang kiểm tra Database...");
        if (context.Database.GetPendingMigrations().Any())
        {
            await context.Database.MigrateAsync();
        }

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        logger.LogInformation("Identity Service: Đang Seed dữ liệu mẫu...");
        // Lưu ý thứ tự tham số seed phải đúng với file IdentityDataSeeder.cs
        await IdentityDataSeeder.SeedAsync(userManager, roleManager, context);

        logger.LogInformation("Identity Service: Khởi động thành công!");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Lỗi nghiêm trọng trong quá trình khởi tạo Database.");
    }
}

app.Run();