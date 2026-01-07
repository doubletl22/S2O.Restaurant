using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using S20.Services.Tenants.Application.Interfaces;
using S20.Services.Tenants.Application.Interfaces.Repositories;
using S20.Services.Tenants.Application.Services;
using S2O.Services.Tenants.Infrastructure.Data;
using S2O.Services.Tenants.Infrastructure.Repository;
using System.Text;

namespace S20.Services.Tenants.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<TenantDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("TenantDb"))
            );

            builder.Services.AddHttpContextAccessor();

            builder.Services.AddScoped<ITenantServices, TenantServices>();
            builder.Services.AddScoped<ITenantMembershipService, TenantMembershipService>();
            builder.Services.AddScoped<ITenantProvider, TenantProvider>();
            builder.Services.AddScoped<ITenantRepository,  TenantRepository>();
            builder.Services.AddScoped<ITenantUnitOfWork, TenantUnitOfWork>();
            builder.Services.AddScoped<ITenantUserRepository, TenantUserRepository>();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
