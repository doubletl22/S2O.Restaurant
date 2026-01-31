using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;

namespace S2O.Order.Api.Controllers;

[Route("api/v1/storefront/orders")]
[ApiController]
public class StorefrontOrdersController : ControllerBase
{
    private readonly ISender _sender;

    public StorefrontOrdersController(ISender sender)
    {
        _sender = sender;
    }

    // POST: api/v1/storefront/orders/guest
    [HttpPost("guest")]
    [AllowAnonymous] // Khách vãng lai không cần login
    public async Task<IActionResult> PlaceGuestOrder([FromBody] PlaceGuestOrderCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // Nếu có tính năng khách hàng đăng nhập rồi đặt (Customer), thêm vào đây:
    // [HttpPost("customer")]
    // [Authorize(Roles = "Customer")]
    // ...
}