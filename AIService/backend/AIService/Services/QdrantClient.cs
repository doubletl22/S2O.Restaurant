using System.Net.Http.Json;
using System.Text.Json;

namespace S2O.AIService.Services;

public sealed class QdrantClient
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _cfg;

    public QdrantClient(IHttpClientFactory httpFactory, IConfiguration cfg)
    {
        _httpFactory = httpFactory;
        _cfg = cfg;
    }

    private string BaseUrl => _cfg["Qdrant:BaseUrl"]!;
    private string Collection => _cfg["Qdrant:Collection"]!;
    private int VectorSize => int.Parse(_cfg["Qdrant:VectorSize"]!);

    public async Task EnsureCollectionAsync()
    {
        var http = _httpFactory.CreateClient();
        var url = $"{BaseUrl}/collections/{Collection}";

        var res = await http.GetAsync(url);
        if (res.IsSuccessStatusCode) return;

        var body = new
        {
            vectors = new
            {
                size = VectorSize,
                distance = "Cosine"
            }
        };

        var createRes = await http.PutAsJsonAsync(url, body);
        createRes.EnsureSuccessStatusCode();
    }

    public async Task UpsertAsync(IEnumerable<object> points)
    {
        var http = _httpFactory.CreateClient();
        var url = $"{BaseUrl}/collections/{Collection}/points?wait=true";

        var body = new { points = points };
        var res = await http.PutAsJsonAsync(url, body);
        res.EnsureSuccessStatusCode();
    }

    public async Task<List<(string Title, string ChunkText)>> SearchAsync(
        float[] vector,
        string tenantId,
        string restaurantId,
        int topK = 5)
    {
        var http = _httpFactory.CreateClient();
        var url = $"{BaseUrl}/collections/{Collection}/points/search";

        var body = new
        {
            vector = vector,
            limit = topK,
            with_payload = true,
            filter = new
            {
                must = new object[]
                {
                    new { key = "tenantId", match = new { value = tenantId } },
                    new { key = "restaurantId", match = new { value = restaurantId } }
                }
            }
        };

        var res = await http.PostAsJsonAsync(url, body);
        res.EnsureSuccessStatusCode();

        using var stream = await res.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);

        var result = new List<(string Title, string ChunkText)>();

        var hits = doc.RootElement.GetProperty("result");
        foreach (var h in hits.EnumerateArray())
        {
            if (!h.TryGetProperty("payload", out var payload)) continue;

            var title = payload.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
            var chunk = payload.TryGetProperty("chunkText", out var c) ? c.GetString() ?? "" : "";

            if (!string.IsNullOrWhiteSpace(chunk))
                result.Add((title, chunk));
        }

        return result;
    }
}
