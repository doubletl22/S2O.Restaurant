using S2O.Services.Customer.Application.Interfaces;
using S2O.Services.Customer.Application.Services;
using S2O.Services.Customer.Infrastructure.Data;
using S2O.Services.Customer.Infrastructure.Repositories;
using S2O.Shared.Infra; 

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSharedInfra<CustomerDbContext>(builder.Configuration);
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();

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