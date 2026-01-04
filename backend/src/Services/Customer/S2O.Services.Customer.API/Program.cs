using S2O.Services.Customer.Application.Interfaces;
using S2O.Services.Customer.Application.Services;
using S2O.Services.Customer.Infrastructure.Data;
using S2O.Services.Customer.Infrastructure.Repositories;
using S2O.Shared.Infra; // Để dùng AddSharedInfra

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services to the container.
builder.Services.AddControllers(); // Bật Controllers
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Dùng Swagger của .NET 8

// 2. Database & Shared Infra (Tương tự Identity Service)
// Lưu ý: Đảm bảo appsettings.json đã có ConnectionStrings:DefaultConnection
builder.Services.AddSharedInfra<CustomerDbContext>(builder.Configuration);

// 3. Dependency Injection (Đăng ký các lớp của Customer)
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();

var app = builder.Build();

// 4. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization(); // Nếu có Auth

app.MapControllers(); // Map các Controller

app.Run();