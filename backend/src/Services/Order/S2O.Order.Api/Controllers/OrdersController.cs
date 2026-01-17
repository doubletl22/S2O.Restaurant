using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.Domain.Enums;
using System.Security.Claims;

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
    
    [HttpPut("guest/{id}/cancel")]
    [AllowAnonymous] // Khách tự hủy
    public async Task<IActionResult> CancelOrder(Guid id, [FromBody] string reason)
    {
        var command = new CancelOrderCommand(id, reason);
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpPut("guest/{id}")]
    [AllowAnonymous] // Khách tự sửa
    public async Task<IActionResult> UpdateOrder(Guid id, [FromBody] UpdateOrderCommand command)
    {
        if (id != command.OrderId) return BadRequest("ID không khớp");

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpGet("history")]
    [Authorize] 
    public async Task<IActionResult> GetMyHistory()
    {
        // 1. Lấy UserId từ Token (Claim "sub" hoặc "uid")
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("Không tìm thấy thông tin User trong Token");
        }

        var userId = Guid.Parse(userIdString);

        // 2. Gọi Query
        var query = new GetMyOrdersQuery(userId);
        var result = await _sender.Send(query);

        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("customer")] 
    [Authorize]
    public async Task<IActionResult> PlaceCustomerOrder([FromBody] PlaceCustomerOrderCommand command)
    {
        // 1. Lấy UserId từ Token
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Khách hàng";

        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        // 2. Gán vào Command (Bảo mật: Client không thể fake ID của người khác)
        command.UserId = Guid.Parse(userIdString);
        command.UserName = userName;

        // 3. Gửi đi
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}