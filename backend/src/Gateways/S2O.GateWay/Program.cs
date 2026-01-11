using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using S2O.GateWay.Extensions;
using S2O.GateWay.Middlewares;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot(builder.Configuration);

builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true) // optional: false nghĩa là bắt buộc
    .AddEnvironmentVariables();
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<UserContextForwardingMiddleware>();
await app.UseOcelot();

app.Run();