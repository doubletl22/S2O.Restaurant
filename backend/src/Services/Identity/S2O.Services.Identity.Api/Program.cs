using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using S2O.Services.Identity.Application;
using S2O.Services.Identity.Infrastructure;

namespace S2O.Services.Identity.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);


        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Clean Architecture
        builder.Services.AddApplication();
        builder.Services.AddInfrastructure(builder.Configuration);

        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile("firebase-adminsdk.json")
        });

        var app = builder.Build();



        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.MapControllers();
        app.Run();
    }
}
