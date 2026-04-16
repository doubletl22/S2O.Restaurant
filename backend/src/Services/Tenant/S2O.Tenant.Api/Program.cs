using MassTransit;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Infra;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using S2O.Tenant.Api.Services;
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
builder.Services.AddScoped<IAdminStatsService, AdminStatsService>();
builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddHostedService<AutoLockExpiredSubscriptionsService>();
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Migrate database with retry logic
int maxRetries = 5;
int delayMs = 3000;

for (int attempt = 1; attempt <= maxRetries; attempt++)
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var context = services.GetRequiredService<S2O.Tenant.Infra.Persistence.TenantDbContext>();
            
            // Wait for database to be ready
            int dbRetries = 10;
            while (dbRetries > 0)
            {
                try
                {
                    context.Database.OpenConnection();
                    context.Database.CloseConnection();
                    break;
                }
                catch
                {
                    dbRetries--;
                    if (dbRetries == 0) throw;
                    System.Threading.Thread.Sleep(500);
                }
            }
            
            if (context.Database.GetPendingMigrations().Any())
            {
                Console.WriteLine("Executing migrations...");
                context.Database.Migrate();
                Console.WriteLine("✅ Migrations completed successfully");
            }
            else
            {
                Console.WriteLine("✅ Database is up to date");
            }
        }
        break; // Success, exit retry loop
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Migration attempt {attempt}/{maxRetries} failed: {ex.Message}");
        if (attempt == maxRetries)
        {
            Console.WriteLine("⚠️ Migration failed after all retries, continuing anyway...");
        }
        else
        {
            System.Threading.Thread.Sleep(delayMs);
        }
    }
}

app.UseHttpsRedirection();
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();


app.Run();