using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.Services;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Authentication;
using S2O.Identity.Infra.Persistence;
using S2O.Infra.Services;
using S2O.Kernel.Interfaces;
using S2O.Shared.Infra;
using S2O.Shared.Infra.Interceptors;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AuthDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});

builder.Services.AddScoped<IAuthDbContext>(provider => provider.GetRequiredService<AuthDbContext>());
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

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
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddAuthorization();
builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddScoped<S2O.Identity.App.Services.TokenService>();
builder.Services.AddScoped<ITokenProvider, TokenProvider>();
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(S2O.Identity.App.Features.Login.LoginCommand).Assembly));

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); 

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<AuthDbContext>();

        logger.LogInformation("Đang kiểm tra và cập nhật Database (Migration)...");
        await context.Database.MigrateAsync();

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        logger.LogInformation("Đang Seed dữ liệu mẫu...");
        await IdentityDataSeeder.SeedAsync(userManager, roleManager, context);

        logger.LogInformation("Hoàn tất chuẩn bị Database.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Lỗi nghiêm trọng trong quá trình khởi tạo Database.");
    }
}
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AuthDbContext>();
    if (context.Database.GetPendingMigrations().Any())
    {
        context.Database.Migrate();
    }
}
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
app.Run();