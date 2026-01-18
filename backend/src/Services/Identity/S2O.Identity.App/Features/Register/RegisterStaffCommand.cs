using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public record RegisterStaffCommand(
    string FullName,
    string Email,
    string Password,
    Guid BranchId // Nhân viên này làm ở chi nhánh nào?
) : IRequest<Result<Guid>>;