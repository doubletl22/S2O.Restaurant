using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.Domain.Enums;

namespace S2O.Order.Api.Controllers;

[Route("api/staff/orders")]
[ApiController]
[Authorize] // Yêu cầu đăng nhập
// [Authorize(Roles = "Staff,RestaurantOwner")] // Nếu bạn đã cấu hình Role claim chuẩn
public class StaffOrdersController : ControllerBase
{
    private readonly ISender _sender;

    public StaffOrdersController(ISender sender)
    {
        _sender = sender;
    }

    // GET: api/staff/orders?status=Pending
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status)
    {
        // 1. Lấy BranchId từ Token (Lúc đăng nhập Identity đã nhét vào claim "branch_id")
        var branchIdClaim = User.FindFirst("branch_id")?.Value;

        if (string.IsNullOrEmpty(branchIdClaim))
        {
            return BadRequest("Tài khoản này không thuộc chi nhánh nào.");
        }

        var branchId = Guid.Parse(branchIdClaim);

        // 2. Gọi Query
        var result = await _sender.Send(new GetBranchOrdersQuery(branchId, status));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // PUT: api/staff/orders/{id}/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatus newStatus)
    {
        var branchIdClaim = User.FindFirst("branch_id")?.Value;
        if (string.IsNullOrEmpty(branchIdClaim)) return BadRequest("Missing Branch Info");

        var command = new UpdateOrderStatusCommand(id, newStatus, Guid.Parse(branchIdClaim));

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }
}