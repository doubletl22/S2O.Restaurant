using Microsoft.EntityFrameworkCore;
using S2O.Shared.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using S2O.Tenant.App.Features.Tables; 
using S2O.Tenant.Infra; 

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

builder.Services.AddTenantInfra(builder.Configuration); 
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateTableCommand).Assembly));

builder.Services.AddScoped<ITenantContext, TenantContext>();

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
app.UseAuthorization();
app.MapControllers();

app.Run();