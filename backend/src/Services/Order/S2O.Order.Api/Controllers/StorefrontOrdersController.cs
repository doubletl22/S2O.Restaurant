using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;

namespace S2O.Order.Api.Controllers;

[ApiController]
[Route("api/v1/storefront/orders")] // ✅ khớp Gateway + Frontend
public class StorefrontOrdersController : ControllerBase
{
    private readonly ISender _sender;

    public StorefrontOrdersController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("guest")] // ✅ khớp /guest
    [AllowAnonymous]
    public async Task<IActionResult> PlaceGuestOrder(
        [FromBody] PlaceGuestOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
            return Ok(result);

        return BadRequest(result); // ✅ trả nguyên result cho frontend đọc lỗi
    }
}
