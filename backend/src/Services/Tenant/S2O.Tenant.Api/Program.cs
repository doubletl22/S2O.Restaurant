using Microsoft.EntityFrameworkCore;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using S2O.Tenant.App.Features.Tables; // Namespace chứa MediatR handler
using S2O.Tenant.Infra; // Namespace chứa DependencyInjection
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

// 2. Add Layer Dependencies
builder.Services.AddTenantInfra(builder.Configuration); // Gọi hàm extension bên Infra
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateTableCommand).Assembly));

// 3. Shared Services
builder.Services.AddScoped<ITenantContext, TenantContext>();

var app = builder.Build();

// Configure Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // Lưu ý: Đảm bảo TenantDbContext được public hoặc reference đúng namespace
        var context = services.GetRequiredService<S2O.Tenant.Infra.Persistence.TenantDbContext>();

        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        // Log lỗi nếu cần
        Console.WriteLine("Lỗi Migration Tenant: " + ex.Message);
    }
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();