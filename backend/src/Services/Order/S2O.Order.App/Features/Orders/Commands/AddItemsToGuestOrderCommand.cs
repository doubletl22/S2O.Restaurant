using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class AddItemsToGuestOrderCommand : IRequest<Result>
{
    public Guid OrderId { get; set; }
    public Guid TenantId { get; set; }
    public List<GuestOrderItemDto> Items { get; set; } = new();
}
