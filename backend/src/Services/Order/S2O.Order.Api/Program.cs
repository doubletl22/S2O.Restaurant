using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Infra.Services;
using S2O.Shared.Kernel.Interfaces;
using S2O.Order.Api.Hubs;
using S2O.Order.Api.Services;
using S2O.Order.App.Abstractions;
using S2O.Order.Infra.ExternalServices;
using S2O.Order.Infra.Persistence;
using S2O.Shared.Infra;
using S2O.Shared.Infra.Interceptors;
using S2O.Shared.Infra.Services;
using System.Text.Json.Serialization;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<UpdateAuditableEntitiesInterceptor>();
builder.Services.AddDbContext<OrderDbContext>((sp, options) => {
    var interceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});
builder.Services.AddScoped<IOrderDbContext>(sp => sp.GetRequiredService<OrderDbContext>());

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddMediatR(cfg =>
        cfg.RegisterServicesFromAssembly(typeof(S2O.Order.App.Features.Orders.Commands.PlaceGuestOrderCommand).Assembly));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    }); builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập Token từ Identity Service"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddSignalR();
builder.Services.AddScoped<IOrderNotifier, OrderNotifier>();
builder.Services.AddTransient<AuthenticationDelegatingHandler>();
builder.Services.AddHttpClient<ICatalogClient, CatalogClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ExternalServices:CatalogUrl"]!);
})
.AddHttpMessageHandler<AuthenticationDelegatingHandler>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    if (context.Database.GetPendingMigrations().Any())
    {
        context.Database.Migrate();
    }
}
app.UseHttpsRedirection();
app.MapHub<OrderHub>("/hubs/orders");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // Lưu ý: Thay 'TenantsDbContext' bằng tên DbContext tương ứng của Service đó
        // Ví dụ: CatalogDbContext, OrderDbContext...
        var context = services.GetRequiredService<S2O.Order.Infra.Persistence.OrderDbContext>();

        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Lỗi Migration: {ex.Message}");
    }
}
app.Run();