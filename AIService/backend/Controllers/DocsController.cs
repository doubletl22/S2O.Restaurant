using Microsoft.AspNetCore.Mvc;
using S2O.AIService.Contracts;
using S2O.AIService.Services;

namespace S2O.AIService.Controllers;

[ApiController]
[Route("api/docs")]
public sealed class DocsController : ControllerBase
{
    private readonly RagService _rag;

    public DocsController(RagService rag)
    {
        _rag = rag;
    }

    [HttpPost("ingest")]
    public async Task<IActionResult> Ingest([FromBody] IngestDocRequest req)
    {
        await _rag.IngestDocAsync(req.TenantId, req.RestaurantId, req.Title, req.Content);
        return Ok(new { ok = true });
    }
}
