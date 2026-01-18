using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

// Input gọn hơn Guest nhiều, chỉ cần chọn món
public record PlaceCustomerOrderCommand(
    Guid TenantId,
    Guid BranchId,
    Guid TableId,
    List<GuestOrderItemDto> Items
) : IRequest<Result<Guid>>
{
    // Property này để Controller gán vào sau khi giải mã Token
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
}