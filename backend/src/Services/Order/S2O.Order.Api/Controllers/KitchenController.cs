using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Order.Infra.Persistence;
using S2O.Order.Domain.Enums;

namespace S2O.Order.Api.Controllers;

[Route("api/v1/kitchen")]
[ApiController]
public class KitchenController : ControllerBase
{
    private readonly OrderDbContext _context;

    public KitchenController(OrderDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff, Manager, Chef")]
    public async Task<IActionResult> GetKitchenTickets([FromQuery] Guid branchId)
    {
        var branchScopeResult = ResolveRequestedBranch(branchId);
        if (branchScopeResult.error != null)
        {
            return branchScopeResult.error;
        }

        var effectiveBranchId = branchScopeResult.branchId!.Value;

        var activeOrders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.BranchId == effectiveBranchId
                        && o.Status != OrderStatus.Paid
                        && o.Status != OrderStatus.Cancelled)
            .OrderBy(o => o.OrderDate) 
            .ToListAsync();

        var tickets = activeOrders
            .Where(o => o.Items.Any(i => i.Status == OrderStatus.Pending || i.Status == OrderStatus.Cooking))
            .Select(o => new
            {
                OrderId = o.Id,
                TableName = o.TableName ?? "Unknown",

                Time = o.OrderDate.ToString("HH:mm"),

                Status = o.Items.Any(i => i.Status == OrderStatus.Pending) ? "Pending" : "Cooking",
                Items = o.Items
                    .Where(i => i.Status != OrderStatus.Ready && i.Status != OrderStatus.Cancelled)
                    .Select(i => new {
                        i.Id,
                        i.ProductName,
                        i.Quantity,
                        i.Note,
                        Status = i.Status.ToString()
                    })
                    .ToList()
            })
            .ToList();

        return Ok(tickets);
    }

    [HttpPut("items/{itemId}/status")]
    public IActionResult UpdateItemStatus(Guid itemId, [FromBody] string newStatus)
    {
        // TODO: Implement logic update status món ăn
        return Ok(new { message = "Update status success" });
    }

    private Guid GetBranchIdFromToken()
    {
        var branchClaim = User.FindFirst("branch_id")?.Value;
        return Guid.TryParse(branchClaim, out var branchId) ? branchId : Guid.Empty;
    }

    private (Guid? branchId, IActionResult? error) ResolveRequestedBranch(Guid requestedBranchId)
    {
        if (User.IsInRole("RestaurantOwner"))
        {
            if (requestedBranchId == Guid.Empty)
            {
                return (null, BadRequest("BranchId là bắt buộc."));
            }

            return (requestedBranchId, null);
        }

        var branchIdFromToken = GetBranchIdFromToken();
        if (branchIdFromToken == Guid.Empty)
        {
            return (null, BadRequest("Không xác định được chi nhánh."));
        }

        if (requestedBranchId != Guid.Empty && requestedBranchId != branchIdFromToken)
        {
            return (null, Forbid());
        }

        return (branchIdFromToken, null);
    }
}