using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Queries;

public class GetGuestOrdersByTableHandler : IRequestHandler<GetGuestOrdersByTableQuery, Result<GuestOrderTrackingDto>>
{
    private readonly IOrderDbContext _context;

    public GetGuestOrdersByTableHandler(IOrderDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GuestOrderTrackingDto>> Handle(GetGuestOrdersByTableQuery request, CancellationToken ct)
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.TableId == request.TableId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(ct);

        var dto = new GuestOrderTrackingDto();

        foreach (var o in orders)
        {
            foreach (var i in o.Items)
            {
                dto.Items.Add(new GuestOrderTrackingItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Note = i.Note,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    Status = o.Status
                });

                dto.TotalAmount += i.TotalPrice;
            }
        }

        return Result<GuestOrderTrackingDto>.Success(dto);
    }
}
