using MediatR;
using S2O.Order.App.DTOs;
using S2O.Shared.Kernel.Results;
using S2O.Order.Domain.Enums;

namespace S2O.Order.App.Features.Orders.Queries;

// Input: BranchId (Lấy từ Token của nhân viên), lọc theo Status (Optional)
public record GetBranchOrdersQuery(Guid BranchId, OrderStatus? Status) : IRequest<Result<List<StaffOrderDto>>>;