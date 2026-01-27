using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Products.Queries;

[Route("api/owner/products")]
[ApiController]
[Authorize(Roles = "RestaurantOwner")] // Chỉ Owner được gọi
public class OwnerProductsController : ControllerBase
{
    private readonly ISender _sender;
    public OwnerProductsController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] string? keyword = null, [FromQuery] Guid? categoryId = null)
    {
        var result = await _sender.Send(new GetOwnerProductsQuery(page, size, keyword, categoryId));
        return Ok(result.Value);
    }
}