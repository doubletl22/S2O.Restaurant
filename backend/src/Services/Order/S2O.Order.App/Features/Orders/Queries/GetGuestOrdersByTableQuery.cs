using MediatR;
using S2O.Order.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Queries;

public record GetGuestOrdersByTableQuery(Guid TableId) : IRequest<Result<GuestOrderTrackingDto>>;
