using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.Features.Products;
using S2O.Catalog.Infra.Persistence;
using S2O.Shared.Implementations;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Infra.Services;
using S2O.Shared.Interfaces;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database & Interceptor (Lưu ý dùng DB riêng S2O_Catalog_Db)
builder.Services.AddScoped<UpdateAuditableEntitiesInterceptor>();
builder.Services.AddDbContext<CatalogDbContext>((sp, options) => {
    var interceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});
builder.Services.AddScoped<ICatalogDbContext>(sp => sp.GetRequiredService<CatalogDbContext>());

// 2. Cấu hình AWS S3
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddScoped<IFileStorageService, S3StorageService>();

// 3. Cấu hình Multi-tenant & User Context
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantContext, TenantContext>();
builder.Services.AddScoped<IUserContext, UserContext>();

// 4. Cấu hình MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateProductCommand).Assembly));

// 5. Cấu hình JWT Authentication (Copy từ Identity Service để giải mã Token)
builder.Services.AddAuthentication(options =>
{
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
builder.Services.AddSwaggerGen(); // Đừng quên cấu hình nút Authorize như bên Identity

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<CatalogDbContext>();
    await CatalogDataSeeder.SeedAsync(context);
}
// Middleware giải mã TenantId từ Token JWT
app.UseAuthentication();
// app.UseTenantResolver(); // Nếu Lâm đã viết Middleware này trong Shared
app.UseAuthorization();
app.MapControllers();

app.Run();