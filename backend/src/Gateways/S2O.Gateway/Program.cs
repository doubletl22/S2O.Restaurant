using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using S2O.Shared.Infra; 

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
    policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000") 
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials();
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