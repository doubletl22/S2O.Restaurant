using Microsoft.EntityFrameworkCore;
using S2O.AIService.Data;
using S2O.AIService.Services;
using S2O.AIService.Services.Llm;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Postgres"));
});

builder.Services.AddHttpClient(); // for OpenAI + Qdrant

builder.Services.AddSingleton<IntentRouter>();
builder.Services.AddScoped<RestaurantToolsService>();
builder.Services.AddScoped<RagService>();
builder.Services.AddScoped<QdrantClient>();
builder.Services.AddSingleton<TextChunker>();

builder.Services.AddScoped<LlmClient>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();
