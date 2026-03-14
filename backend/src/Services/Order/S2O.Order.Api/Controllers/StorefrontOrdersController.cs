using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;

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

    // GET: api/v1/storefront/orders/{id} – Guest xem trạng thái đơn hàng
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGuestOrderStatus(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGuestOrderStatusQuery(id), cancellationToken);

        if (result.IsSuccess)
            return Ok(new { isSuccess = true, value = result.Value });

        return NotFound(new { isSuccess = false, error = new { code = result.Error.Code, description = result.Error.Description } });
    }

    [HttpPost("guest")] // ✅ khớp /guest
    [AllowAnonymous]
    public async Task<IActionResult> PlaceGuestOrder(
        [FromBody] PlaceGuestOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
            return Ok(new { isSuccess = true, value = new { orderId = result.Value } });

        return BadRequest(new { isSuccess = false, error = new { code = result.Error.Code, description = result.Error.Description } }); // ✅ Safe response
    }

    // POST: api/v1/storefront/orders/{id}/items – Guest thêm món vào đơn hiện có
    [HttpPost("{id:guid}/items")]
    [AllowAnonymous]
    public async Task<IActionResult> AddItemsToGuestOrder(
        Guid id,
        [FromBody] AddItemsToGuestOrderCommand command,
        CancellationToken cancellationToken)
    {
        command.OrderId = id;
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
            return Ok(new { isSuccess = true });

        if (result.Error.Code == "Order.NotFound")
            return NotFound(new { isSuccess = false, error = new { code = result.Error.Code, description = result.Error.Description } });

        return BadRequest(new { isSuccess = false, error = new { code = result.Error.Code, description = result.Error.Description } });
    }
}
