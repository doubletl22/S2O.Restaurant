using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using S2O.GateWay.Extensions;
using S2O.GateWay.Middlewares;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddJwtAuthentication(builder.Configuration);
// Authorization
builder.Services.AddRoleAuthorization(builder.Configuration);
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<UserContextForwardingMiddleware>();

app.MapReverseProxy();

app.Run();