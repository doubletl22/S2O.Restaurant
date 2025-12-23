using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using S2O.AIService.Contracts;
using S2O.AIService.Services;
using S2O.AIService.Services.Llm;

namespace S2O.AIService.Controllers;

[ApiController]
[Route("api/chatbot")]
public sealed class ChatbotController : ControllerBase
{
    private readonly IntentRouter _router;
    private readonly RestaurantToolsService _tools;
    private readonly RagService _rag;
    private readonly LlmClient _llm;

    public ChatbotController(IntentRouter router, RestaurantToolsService tools, RagService rag, LlmClient llm)
    {
        _router = router;
        _tools = tools;
        _rag = rag;
        _llm = llm;
    }

    [HttpPost("ask")]
    public async Task<ActionResult<AskResponse>> Ask([FromBody] AskRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.TenantId) || string.IsNullOrWhiteSpace(req.RestaurantId))
            return BadRequest("tenantId và restaurantId là bắt buộc.");

        var intent = _router.DetectIntent(req.Message);

        // TOOL FLOW
        if (intent is "OPEN_HOURS" or "MENU_AVAILABILITY" or "TABLE_AVAILABILITY" or "BEST_SELLERS")
        {
            object toolData = intent switch
            {
                "OPEN_HOURS" => new { openHoursJson = await _tools.GetOpenHoursJsonAsync(req.TenantId, req.RestaurantId) },
                "MENU_AVAILABILITY" => await _tools.CheckMenuAvailabilityAsync(req.TenantId, req.RestaurantId, req.Message),
                "TABLE_AVAILABILITY" => await _tools.GetTableAvailabilityAsync(req.TenantId, req.RestaurantId),
                "BEST_SELLERS" => await _tools.GetBestSellersAsync(req.TenantId, req.RestaurantId, rangeDays: 7),
                _ => new { }
            };

            var json = JsonSerializer.Serialize(toolData, new JsonSerializerOptions { WriteIndented = true });
            var context = PromptTemplates.BuildToolContext(intent, json);

            var answer = await _llm.ChatAsync(PromptTemplates.SystemChatbot, req.Message, context);

            return Ok(new AskResponse
            {
                Intent = intent,
                Answer = answer,
                Sources = new List<string>() // tool-based nên không cần sources
            });
        }

        // RAG FLOW (default)
        var ragHits = await _rag.RetrieveAsync(req.TenantId, req.RestaurantId, req.Message, topK: 5);
        var ragContext = PromptTemplates.BuildRagContext(ragHits.Select(h => (h.Title, h.ChunkText)).ToList());

        var ragAnswer = await _llm.ChatAsync(PromptTemplates.SystemChatbot, req.Message, ragContext);

        return Ok(new AskResponse
        {
            Intent = intent,
            Answer = ragAnswer,
            Sources = ragHits.Select(h => h.Title).Distinct().ToList()
        });
    }
}
