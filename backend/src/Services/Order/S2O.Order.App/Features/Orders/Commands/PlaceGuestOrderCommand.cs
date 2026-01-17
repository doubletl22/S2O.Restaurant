using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public record GuestOrderItemDto(Guid ProductId, int Quantity, string? Note);

public record PlaceGuestOrderCommand(
    Guid TenantId,  // Lấy từ QR
    Guid BranchId,  // Lấy từ QR (hoặc chọn lúc đầu)
    Guid TableId,   // Lấy từ QR (nếu có)
    string GuestName, // "Khách bàn 5"
    string GuestPhone, // Optional
    List<GuestOrderItemDto> Items
) : IRequest<Result<Guid>>;