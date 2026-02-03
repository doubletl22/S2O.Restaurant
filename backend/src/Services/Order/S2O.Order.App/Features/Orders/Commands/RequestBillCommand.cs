using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Commands;

public class RequestBillCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid TableId { get; set; }
}
