using MediatR;
using S2O.Order.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Order.App.Features.Orders.Queries;

public record GetOrdersQuery : IQuery<List<Domain.Entities.Order>>;