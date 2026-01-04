using Microsoft.EntityFrameworkCore;
using S2O.Services.Identity.Application.Common.Interfaces;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Application.Services;
using S2O.Services.Identity.Infrastructure.Data;
using S2O.Services.Identity.Infrastructure.Security; 

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<IdentityDbContext>());
builder.Services.AddScoped<IAuthService, AuthService>();   
builder.Services.AddScoped<ITokenService, TokenService>(); 
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>(); 

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();