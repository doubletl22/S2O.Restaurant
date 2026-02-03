using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // [QUAN TRỌNG] Để dùng .Include(), .ToListAsync()
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.Domain.Enums;
using S2O.Order.Infra.Persistence; // [QUAN TRỌNG] Namespace chứa OrderDbContext

namespace S2O.Order.Api.Controllers;

[Route("api/v1/orders")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly ISender _sender;
    private readonly OrderDbContext _context; // [FIX 1] Khai báo biến _context

    // [FIX 1] Inject OrderDbContext vào Constructor
    public OrdersController(ISender sender, OrderDbContext context)
    {
        _sender = sender;
        _context = context;
    }

    // ==========================================
    // 1. BACKOFFICE (Dành cho Staff/Owner)
    // ==========================================

    // GET: api/v1/orders?status=Cooking
    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status)
    {
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

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // ==========================================
    // [MỚI THÊM] API ACTIVE ORDERS
    // ==========================================

    // GET: api/v1/orders/active?branchId=...
    [HttpGet("active")]
    // [Authorize(Roles = "RestaurantOwner, Staff")] // Nên bật Authorize
    public async Task<IActionResult> GetActiveOrders([FromQuery] Guid branchId)
    {
        // [FIX 2] Sử dụng _context đã inject ở trên
        var orders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.BranchId == branchId
                        // [FIX 3] So sánh với Enum thay vì string "Paid"
                        && o.Status != OrderStatus.Paid
                        && o.Status != OrderStatus.Cancelled)
            .OrderByDescending(o => o.OrderDate) // Đảm bảo Property tên là CreatedOn (theo file Entity bạn upload)
            .ToListAsync();

        return Ok(orders);
    }

    // ==========================================
    // HELPER
    // ==========================================
    private Guid GetBranchIdFromToken()
    {
        var branchClaim = User.FindFirst("branch_id")?.Value;
        if (string.IsNullOrEmpty(branchClaim))
        {
            // Nếu chưa có Token chuẩn, trả về Guid Empty hoặc throw lỗi tùy bạn
            // throw new Exception("Không tìm thấy BranchId trong Token.");
            return Guid.Empty;
        }
        return Guid.Parse(branchClaim);
    }
}