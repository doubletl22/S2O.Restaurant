using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;
using S2O.Order.Domain.Enums;
using S2O.Order.Infra.Persistence; 

namespace S2O.Order.Api.Controllers;

[Route("api/v1/orders")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly ISender _sender;
    private readonly OrderDbContext _context; 

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
    [Authorize(Roles = "RestaurantOwner, Staff, Manager")]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status)
    {
        var branchId = GetBranchIdFromToken();
        var result = await _sender.Send(new GetBranchOrdersQuery(branchId, status));

        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // GET: api/v1/orders/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "RestaurantOwner, Staff, Manager")]
    public async Task<IActionResult> GetOrderDetail(Guid id)
    {
        var branchId = GetBranchIdFromToken();
        var result = await _sender.Send(new GetOrderDetailQuery(id, branchId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // PATCH: api/v1/orders/{id}/status
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "RestaurantOwner, Staff, Manager")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
    {
        if (id != command.OrderId) return BadRequest("ID không khớp");

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // PATCH: api/v1/orders/{orderId}/items/{itemId}
    [HttpPatch("{orderId:guid}/items/{itemId:guid}")]
    [Authorize(Roles = "RestaurantOwner, Staff, Manager")]
    public async Task<IActionResult> UpdateOrderItemQuantity(
        Guid orderId,
        Guid itemId,
        [FromBody] UpdateOrderItemQuantityCommand command)
    {
        var branchId = GetBranchIdFromToken();
        if (branchId == Guid.Empty) return BadRequest("Không xác định được chi nhánh.");

        var fixedCommand = command with
        {
            OrderId = orderId,
            OrderItemId = itemId,
            CurrentBranchId = branchId
        };

        var result = await _sender.Send(fixedCommand);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // ==========================================
    // [MỚI THÊM] API ACTIVE ORDERS
    // ==========================================

    // GET: api/v1/orders/active?branchId=...
    [HttpGet("active")]
    [Authorize(Roles = "RestaurantOwner, Staff, Manager")]
    public async Task<IActionResult> GetActiveOrders([FromQuery] Guid branchId)
    {
        var branchScopeResult = ResolveRequestedBranch(branchId);
        if (branchScopeResult.error != null)
        {
            return branchScopeResult.error;
        }

        var effectiveBranchId = branchScopeResult.branchId!.Value;

        // [FIX 2] Sử dụng _context đã inject ở trên
        var orders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.BranchId == effectiveBranchId
                        // [FIX 3] So sánh với Enum thay vì string "Paid"
                        && o.Status != OrderStatus.Paid
                        && o.Status != OrderStatus.Cancelled)
            .OrderByDescending(o => o.OrderDate) // Đảm bảo Property tên là CreatedOn (theo file Entity bạn upload)
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/v1/orders/owner/revenue-series
    [HttpGet("owner/revenue-series")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> GetOwnerRevenueSeries(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] bool allTime = false,
        [FromQuery] Guid? branchId = null)
    {
        var tenantId = GetTenantIdFromToken();
        if (tenantId == Guid.Empty) return BadRequest("Không xác định được tenant.");

        var rangeValidationError = ValidateDateRange(allTime, from, to);
        if (rangeValidationError is not null) return rangeValidationError;

        var query = _context.Orders
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(o => o.TenantId == tenantId)
            .Where(o => o.Status == OrderStatus.Paid || o.Status == OrderStatus.Completed);

        if (branchId.HasValue && branchId != Guid.Empty)
        {
            query = query.Where(o => o.BranchId == branchId.Value);
        }

        if (!allTime)
        {
            var fromDate = DateTime.SpecifyKind((from ?? DateTime.UtcNow.Date.AddDays(-6)).Date, DateTimeKind.Utc);
            var toDate = DateTime.SpecifyKind((to ?? DateTime.UtcNow.Date).Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
            query = query.Where(o => o.OrderDate >= fromDate && o.OrderDate <= toDate);
        }

        var result = await query
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new
            {
                Date = g.Key,
                Revenue = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Date)
            .ToListAsync();

        return Ok(result);
    }

    // POST: api/v1/orders/{id}/cancel
    [HttpPost("{id}/cancel")]
    [Authorize(Roles = "RestaurantOwner, Staff, Manager")]
    public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderCommand command)
    {
        // Đảm bảo ID trên URL khớp với ID trong Body
        if (id != command.OrderId) return BadRequest("ID đơn hàng không khớp.");

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // GET: api/v1/orders/owner/revenue-by-branch
    [HttpGet("owner/revenue-by-branch")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> GetOwnerRevenueByBranch(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] bool allTime = false)
    {
        var tenantId = GetTenantIdFromToken();
        if (tenantId == Guid.Empty) return BadRequest("Không xác định được tenant.");

        var rangeValidationError = ValidateDateRange(allTime, from, to);
        if (rangeValidationError is not null) return rangeValidationError;

        var query = _context.Orders
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(o => o.TenantId == tenantId)
            .Where(o => o.Status == OrderStatus.Paid || o.Status == OrderStatus.Completed);

        if (!allTime)
        {
            var fromDate = DateTime.SpecifyKind((from ?? DateTime.UtcNow.Date.AddDays(-6)).Date, DateTimeKind.Utc);
            var toDate = DateTime.SpecifyKind((to ?? DateTime.UtcNow.Date).Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
            query = query.Where(o => o.OrderDate >= fromDate && o.OrderDate <= toDate);
        }

        var result = await query
            .GroupBy(o => o.BranchId)
            .Select(g => new
            {
                BranchId = g.Key,
                Revenue = g.Sum(x => x.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderByDescending(x => x.Revenue)
            .ToListAsync();

        return Ok(result);
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

    private Guid GetTenantIdFromToken()
    {
        var tenantClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrEmpty(tenantClaim)) return Guid.Empty;
        return Guid.Parse(tenantClaim);
    }

    private IActionResult? ValidateDateRange(bool allTime, DateTime? from, DateTime? to)
    {
        if (allTime)
        {
            return null;
        }

        var fromDate = (from ?? DateTime.UtcNow.Date).Date;
        var toDate = (to ?? DateTime.UtcNow.Date).Date;
        if (fromDate > toDate)
        {
            return BadRequest("Khoảng thời gian không hợp lệ: from phải nhỏ hơn hoặc bằng to.");
        }

        return null;
    }

    private (Guid? branchId, IActionResult? error) ResolveRequestedBranch(Guid requestedBranchId)
    {
        var branchIdFromToken = GetBranchIdFromToken();
        if (User.IsInRole("RestaurantOwner"))
        {
            // Owner có thể xem bất kỳ chi nhánh nào, nhưng bắt buộc phải xác định được chi nhánh cần xem
            if (requestedBranchId == Guid.Empty)
            {
                return (null, BadRequest("BranchId là bắt buộc đối với Owner."));
            }
            return (requestedBranchId, null);
        }

        if (branchIdFromToken == Guid.Empty)
        {
            return (null, BadRequest("Không xác định được chi nhánh làm việc của nhân viên."));
        }

        if (requestedBranchId != Guid.Empty && requestedBranchId != branchIdFromToken)
        {
            return (null, Forbid("Bạn không có quyền truy cập dữ liệu của chi nhánh khác."));
        }

        return (branchIdFromToken, null);
    }
}