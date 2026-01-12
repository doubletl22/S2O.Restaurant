using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/public/menu")]
public class PublicMenuController : ControllerBase
{
    private readonly ISender _sender;

    public PublicMenuController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [AllowAnonymous] // Cho phép Guest truy cập
    public async Task<IActionResult> GetMenu([FromQuery] string? categoryId)
    {
        // TenantId sẽ được TenantContext tự động lấy từ Header "X-Tenant-Id"
        // Query bên dưới sẽ tự lọc theo TenantId đó nhờ Global Query Filter trong DbContext
        var query = new GetProductsQuery(categoryId);
        var result = await _sender.Send(query);
        return Ok(result);
    }
}