using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Public; // Namespace chứa GetPublicMenuQuery

namespace S2O.Catalog.Api.Controllers;

[Route("api/v1/storefront/menus")]
[ApiController]
public class StorefrontMenuController : ControllerBase
{
    private readonly ISender _sender;

    public StorefrontMenuController(ISender sender)
    {
        _sender = sender;
    }

    // GET: api/v1/storefront/menus/{tenantId}
    [HttpGet("{tenantId}")]
    [AllowAnonymous] // Public API
    public async Task<IActionResult> GetMenu(Guid tenantId, [FromQuery] string? categoryId)
    {
        var query = new GetPublicMenuQuery(tenantId, categoryId);
        var result = await _sender.Send(query);
        // Lưu ý: Query GetPublicMenuQuery của bạn trả về trực tiếp DTO hay Result<DTO>?
        // Nếu trả về Result thì check IsSuccess, nếu trả về DTO thì return Ok luôn.
        // Code cũ của bạn return Ok(result) nên tôi giữ nguyên.
        return Ok(result);
    }
}