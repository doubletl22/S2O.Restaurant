using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace S2O.AIService.Services.Llm;

public sealed class LlmClient
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly OpenAiOptions _opt;

    public LlmClient(IHttpClientFactory httpFactory, IConfiguration cfg)
    {
        _httpFactory = httpFactory;
        _opt = new OpenAiOptions
        {
            BaseUrl = cfg["OpenAI:BaseUrl"] ?? "https://api.openai.com/v1",
            ApiKey = cfg["OpenAI:ApiKey"] ?? "",
            ChatModel = cfg["OpenAI:ChatModel"] ?? "gpt-4.1-mini",
            EmbeddingModel = cfg["OpenAI:EmbeddingModel"] ?? "text-embedding-3-small"
        };
    }

    private HttpClient CreateHttp()
    {
        var http = _httpFactory.CreateClient();
        http.BaseAddress = new Uri(_opt.BaseUrl.TrimEnd('/') + "/");
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _opt.ApiKey);
        return http;
    }

    public async Task<float[]> EmbedAsync(string text)
    {
        var http = CreateHttp();
        var req = new
        {
            model = _opt.EmbeddingModel,
            input = text
        };

        var res = await http.PostAsJsonAsync("embeddings", req);
        res.EnsureSuccessStatusCode();

        using var stream = await res.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);

        var arr = doc.RootElement.GetProperty("data")[0].GetProperty("embedding");
        var vec = new float[arr.GetArrayLength()];
        int i = 0;
        foreach (var v in arr.EnumerateArray())
            vec[i++] = v.GetSingle();

        return vec;
    }

    public async Task<string> ChatAsync(string system, string user, string context)
    {
        var http = CreateHttp();

        var req = new
        {
            model = _opt.ChatModel,
            messages = new object[]
            {
                new { role = "system", content = system },
                new { role = "user", content = $"{context}\n\n[QUESTION]\n{user}" }
            },
            temperature = 0.2
        };

        var res = await http.PostAsJsonAsync("chat/completions", req);
        res.EnsureSuccessStatusCode();

        using var stream = await res.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);

        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return content ?? "";
    }
}
