using MassTransit;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Infra;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using S2O.Tenant.App.Features.Tables;
using S2O.Tenant.Infra;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<TenantCreatedConsumer>(); // Đăng ký Consumer

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitConfig = builder.Configuration.GetSection("MessageBroker");
        cfg.Host(rabbitConfig["Host"] ?? "localhost");
        cfg.ConfigureEndpoints(context);
    });
});
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddTenantInfra(builder.Configuration);
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateTableCommand).Assembly));
builder.Services.AddSharedInfrastructure(builder.Configuration);
var app = builder.Build();
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
        var context = services.GetRequiredService<S2O.Tenant.Infra.Persistence.TenantDbContext>();
        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("Lỗi Migration Tenant: " + ex.Message);
    }
}

app.UseHttpsRedirection();
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // Lưu ý: Thay 'TenantsDbContext' bằng tên DbContext tương ứng của Service đó
        // Ví dụ: CatalogDbContext, OrderDbContext...
        var context = services.GetRequiredService<S2O.Tenant.Infra.Persistence.TenantDbContext>();

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