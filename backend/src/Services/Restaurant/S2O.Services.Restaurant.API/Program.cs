using S2O.Services.Restaurant.Application.Interfaces;
using S2O.Services.Restaurant.Application.Services;
using S2O.Services.Restaurant.Infrastructure.Data;
using S2O.Services.Restaurant.Infrastructure.Repositories;
using S2O.Shared.Infra;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Kết nối Database
builder.Services.AddSharedInfra<RestaurantDbContext>(builder.Configuration);
builder.Services.AddScoped<RestaurantManagerService>();
builder.Services.AddScoped<AdminTenantService>();
builder.Services.AddScoped<IRestaurantRepository, RestaurantRepository>(); 
builder.Services.AddScoped<RestaurantManagerService>();
builder.Services.AddScoped<AdminTenantService>();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();