using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics; // Cần cho Interceptor
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using S2O.Services.Customer.API.Configurations;
using S2O.Services.Customer.Application.Interfaces;
using S2O.Services.Customer.Application.Services;
using S2O.Services.Customer.Infrastructure.Data;
using S2O.Services.Customer.Infrastructure.Interceptors; // Cần cho AuditableEntityInterceptor
using S2O.Services.Customer.Infrastructure.Repositories; // Cần cho CustomerRepository
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. Swagger Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "S2O Customer API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// --- PHẦN SỬA LỖI DI (QUAN TRỌNG) ---

// 3. Đăng ký Interceptor (Sửa lỗi 1: Unable to resolve ISaveChangesInterceptor)
builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();

// 4. Database (Inject Interceptor vào DbContext)
builder.Services.AddDbContext<CustomerDbContext>((sp, options) =>
{
    var interceptor = sp.GetService<ISaveChangesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor!);
});

// 5. Đăng ký Services & Repositories (Sửa lỗi 2: Unable to resolve ICustomerRepository)
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>(); // <-- Dòng này đang thiếu
builder.Services.AddScoped<ICustomerService, CustomerService>();

// -------------------------------------

// 6. JWT Authentication
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
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
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
    };
});

var app = builder.Build();

// 7. Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();