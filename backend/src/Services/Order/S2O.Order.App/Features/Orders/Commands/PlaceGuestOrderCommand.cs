using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public record GuestOrderItemDto(Guid ProductId, string Name, int Quantity, string? Note);
public class PlaceGuestOrderCommand : IRequest<Result<Guid>>
{
    public Guid TableId { get; set; }
    public Guid TenantId { get; set; }
    public List<GuestOrderItemDto> Items { get; set; } = new();
}