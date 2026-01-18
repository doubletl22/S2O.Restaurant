using MediatR;
using S2O.Shared.Kernel.Results;

public record GetDailyRevenueQuery(Guid BranchId, DateTime Date) : IRequest<Result<decimal>>;