using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.Domain.Enums;

namespace S2O.Order.Api.Controllers;

[Route("api/v1/orders")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly ISender _sender;

    public OrdersController(ISender sender)
    {
        _sender = sender;
    }

    // ==========================================
    // 1. BACKOFFICE (Dành cho Staff/Owner)
    // ==========================================

    // GET: api/v1/orders?status=Cooking
    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status)
    {
        // Query Handler sẽ tự lấy BranchId từ Token (UserContext)
        // Lưu ý: Đảm bảo GetBranchOrdersQuery không yêu cầu truyền BranchId từ ngoài vào 
        // nếu bạn muốn bảo mật tuyệt đối, hoặc lấy từ Claim như code cũ.

        // Giả sử Handler của bạn cần BranchId, ta lấy từ Token:
        var branchId = GetBranchIdFromToken();
        var result = await _sender.Send(new GetBranchOrdersQuery(branchId, status));

        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // GET: api/v1/orders/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetOrderDetail(Guid id)
    {
        var branchId = GetBranchIdFromToken();
        var result = await _sender.Send(new GetOrderDetailQuery(id, branchId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // PATCH: api/v1/orders/{id}/status
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
    {
        if (id != command.OrderId) return BadRequest("ID không khớp");

        // Gán thêm BranchId để đảm bảo an toàn (Staff quán này không sửa đơn quán khác)
        // var safeCommand = command with { BranchId = GetBranchIdFromToken() }; // Nếu record hỗ trợ with

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // ==========================================
    // HELPER
    // ==========================================
    private Guid GetBranchIdFromToken()
    {
        var branchClaim = User.FindFirst("branch_id")?.Value;
        if (string.IsNullOrEmpty(branchClaim))
            throw new Exception("Không tìm thấy BranchId trong Token.");
        return Guid.Parse(branchClaim);
    }
}