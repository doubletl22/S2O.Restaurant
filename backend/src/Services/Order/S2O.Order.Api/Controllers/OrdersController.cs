using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Commands.CreateOrder;
using S2O.Order.App.Features.Orders.Queries;

namespace S2O.Order.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var result = await _mediator.Send(new GetOrdersQuery());
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpPost("guest")]
    [AllowAnonymous] // Mấu chốt: Cho phép không cần đăng nhập
    public async Task<IActionResult> PlaceGuestOrder([FromBody] PlaceGuestOrderCommand command)
    {
        // Frontend PHẢI gửi header "X-Tenant-Id"
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}