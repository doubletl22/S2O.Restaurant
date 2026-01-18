using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.Domain.Enums;

namespace S2O.Order.Api.Controllers;

[Route("api/staff/orders")]
[ApiController]
[Authorize] // Bắt buộc phải có Token (của nhân viên)
public class StaffOrdersController : ControllerBase
{
    private readonly ISender _sender;

    public StaffOrdersController(ISender sender)
    {
        _sender = sender;
    }

    // 1. Lấy danh sách đơn (Có thể lọc theo trạng thái)
    // VD: Bếp chỉ muốn xem đơn "Confirmed" hoặc "Cooking"
    // GET: api/staff/orders?status=Pending
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status)
    {
        var branchId = GetBranchId();
        var result = await _sender.Send(new GetBranchOrdersQuery(branchId, status));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // 2. Lấy chi tiết 1 đơn (Để in hóa đơn hoặc xem kỹ note)
    // GET: api/staff/orders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderDetail(Guid id)
    {
        var branchId = GetBranchId();
        var result = await _sender.Send(new GetOrderDetailQuery(id, branchId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // 3. Cập nhật trạng thái (Quan trọng nhất)
    // PUT: api/staff/orders/{id}/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatus newStatus)
    {
        var branchId = GetBranchId();
        var command = new UpdateOrderStatusCommand(id, newStatus, branchId);

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    // Helper lấy BranchId từ Token
    private Guid GetBranchId()
    {
        var branchClaim = User.FindFirst("branch_id")?.Value;
        if (string.IsNullOrEmpty(branchClaim))
            throw new Exception("Tài khoản này không thuộc chi nhánh nào (Thiếu claim branch_id)");

        return Guid.Parse(branchClaim);
    }
}