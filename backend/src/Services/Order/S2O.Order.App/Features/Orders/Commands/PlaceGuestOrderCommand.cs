using S2O.Shared.Kernel.Abstractions; // Dùng ICommand từ Shared Kernel

namespace S2O.Order.App.Features.Orders.Commands;

// DTO mô tả chi tiết món ăn trong giỏ hàng
public record GuestOrderItemDto(Guid ProductId, int Quantity, string? Note);

// Command yêu cầu đặt món
public record PlaceGuestOrderCommand(
    Guid TableId,
    string GuestName,
    List<GuestOrderItemDto> Items
) : ICommand<Guid>; // Trả về OrderId (Guid) khi thành công