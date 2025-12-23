using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using S2O.AIService.Contracts;
using S2O.AIService.Data;
using S2O.AIService.Services.Llm;

namespace S2O.AIService.Services;

public sealed class RagService
{
    private readonly AppDbContext _db;
    private readonly TextChunker _chunker;
    private readonly LlmClient _llm;
    private readonly QdrantClient _qdrant;

    public RagService(AppDbContext db, TextChunker chunker, LlmClient llm, QdrantClient qdrant)
    {
        _db = db;
        _chunker = chunker;
        _llm = llm;
        _qdrant = qdrant;
    }

    public async Task IngestDocAsync(string tenantId, string restaurantId, string title, string content)
    {
        await _qdrant.EnsureCollectionAsync();

        // lưu doc vào DB (tùy bạn, có thể bỏ)
        var doc = new RestaurantDoc
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            RestaurantId = restaurantId,
            Title = title,
            Content = content,
            UpdatedAt = DateTime.UtcNow
        };

        _db.RestaurantDocs.Add(doc);
        await _db.SaveChangesAsync();

        // chunk + embed + upsert Qdrant
        var chunks = _chunker.Chunk(content);
        var points = new List<object>();

        for (int i = 0; i < chunks.Count; i++)
        {
            var chunkText = chunks[i];
            var vector = await _llm.EmbedAsync(chunkText);

            points.Add(new
            {
                id = Guid.NewGuid().ToString(),
                vector = vector,
                payload = new
                {
                    tenantId,
                    restaurantId,
                    docId = doc.Id.ToString(),
                    title,
                    chunkIndex = i,
                    chunkText
                }
            });
        }

        await _qdrant.UpsertAsync(points);
    }

    public async Task<List<RagHit>> RetrieveAsync(string tenantId, string restaurantId, string question, int topK = 5)
    {
        await _qdrant.EnsureCollectionAsync();

        var qVec = await _llm.EmbedAsync(question);
        var hits = await _qdrant.SearchAsync(qVec, tenantId, restaurantId, topK);

        return hits.Select(h => new RagHit { Title = h.Title, ChunkText = h.ChunkText }).ToList();
    }

    public async Task<string> AnswerWithRagAsync(string tenantId, string restaurantId, string question)
    {
        var hits = await RetrieveAsync(tenantId, restaurantId, question, topK: 5);
        var context = PromptTemplates.BuildRagContext(hits.Select(h => (h.Title, h.ChunkText)).ToList());
        return await _llm.ChatAsync(PromptTemplates.SystemChatbot, question, context);
    }
}
