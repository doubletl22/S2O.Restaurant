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
    // Đăng ký Consumer để lắng nghe sự kiện tạo Tenant
    x.AddConsumer<TenantCreatedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitConfig = builder.Configuration.GetSection("MessageBroker");

        // Cấu hình Host RabbitMQ
        cfg.Host(rabbitConfig["Host"] ?? "localhost", "/", h => {
            h.Username(rabbitConfig["Username"] ?? "guest");
            h.Password(rabbitConfig["Password"] ?? "guest");
        });

        // Tự động cấu hình các Endpoint dựa trên Consumer đã đăng ký
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


app.Run();