using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
// 1. CHÚ Ý: Import đúng namespace chứa GetPublicMenuQuery
using S2O.Catalog.App.Features.Public;

namespace S2O.Catalog.Api.Controllers;

[ApiController]
[Route("api/public/menu")]
public class PublicMenuController : ControllerBase
{
    private readonly ISender _sender;

    public PublicMenuController(ISender sender)
    {
        _sender = sender;
    }

    // API: GET /api/public/menu/{tenantId}?categoryId=...
    [HttpGet("{tenantId}")]
    [AllowAnonymous] // Cho phép truy cập không cần Token
    public async Task<IActionResult> GetMenu(Guid tenantId, [FromQuery] string? categoryId)
    {
        // 2. Sử dụng GetPublicMenuQuery (Feature dành riêng cho khách)
        // Query này sẽ đi kèm với GetPublicMenuHandler có logic .IgnoreQueryFilters()
        var query = new GetPublicMenuQuery(tenantId, categoryId);

        var result = await _sender.Send(query);
        return Ok(result);
    }
}