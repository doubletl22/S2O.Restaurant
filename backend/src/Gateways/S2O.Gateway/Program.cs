using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using S2O.Shared.Infra; 

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
    policy.WithOrigins("http://localhost:5173") // Chỉ đích danh React được vào
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials(); // Cho phép gửi kèm cookie/token nếu cần sau này
    });
});

builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

await app.UseOcelot();

app.Run();