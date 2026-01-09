using MediatR;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.App.Features.Orders.Commands.CreateOrder;

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
}