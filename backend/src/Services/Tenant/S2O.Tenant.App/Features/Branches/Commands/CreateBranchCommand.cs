using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Tenant.App.Features.Branches.Commands;

// Command nhận vào các thông tin cần thiết để tạo chi nhánh
public record CreateBranchCommand(
    Guid TenantId,
    string Name,
    string Address,
    string Phone
) : IRequest<Result<Guid>>;