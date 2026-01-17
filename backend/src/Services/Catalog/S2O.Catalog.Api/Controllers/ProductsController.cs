using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Public;

namespace S2O.Catalog.Api.Controllers;

[Route("api/public/menu")]
[ApiController]
[AllowAnonymous] // <-- Quan trọng: Cho phép truy cập không cần Token
public class PublicMenuController : ControllerBase
{
    private readonly ISender _sender;

    public PublicMenuController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("{tenantId}")]
    public async Task<IActionResult> GetMenu(Guid tenantId)
    {
        var result = await _sender.Send(new GetPublicMenuQuery(tenantId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}