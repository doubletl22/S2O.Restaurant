using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public record RegisterCustomerCommand(
    string Email,
    string Password,
    string FullName,
    Guid TenantId // <-- Khách đăng ký thành viên của quán nào?
) : IRequest<Result<Guid>>;