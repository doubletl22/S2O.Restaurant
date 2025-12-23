
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using S2O.Services.Identity.Application.Configurations;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Application.Services;
<<<<<<< HEAD
using S2O.Services.Identity.Domain.Entities;
=======
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
using S2O.Services.Identity.Infrastructure.Data;

namespace S2O.Services.Identity.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("AuthDb")));


            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                        ValidAudience = builder.Configuration["JwtSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecurityKey"]!))
                    };
                });
            builder.Services.Configure<JwtSettings>(
                builder.Configuration.GetSection("JwtSettings"));

            builder.Services.AddScoped<ITokenService, TokenService>();
<<<<<<< HEAD
=======

>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
<<<<<<< HEAD
            app.UseHttpsRedirection();

            app.UseAuthentication();
=======

            app.UseHttpsRedirection();
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
