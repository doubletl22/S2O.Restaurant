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
    public async Task<IActionResult> GetKitchenTickets([FromQuery] Guid branchId)
    {
        var activeOrders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.BranchId == branchId
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
}