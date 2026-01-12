using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.Domain.Entities;

namespace S2O.Order.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ISender _sender;

    public OrdersController(ISender sender)
    {
        _sender = sender;
    }

    // 1. Guest đặt món (Không cần Auth)
    [HttpPost("guest")]
    [AllowAnonymous]
    public async Task<IActionResult> PlaceGuestOrder([FromBody] PlaceGuestOrderCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 2. Chủ quán xem danh sách (Cần Auth Owner)
    [HttpGet]
    [Authorize] // Yêu cầu Token
    public async Task<IActionResult> GetOrders()
    {
        var result = await _sender.Send(new GetOrdersQuery());
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 3. Cập nhật trạng thái (Cần Auth Owner/Staff)
    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatus newStatus)
    {
        var command = new UpdateOrderStatusCommand(id, newStatus);
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}