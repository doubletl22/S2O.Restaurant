using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Login;

public record LoginWithFirebaseCommand(
    string FirebaseToken,
    Guid TenantId // Khách này đang đăng nhập vào quán nào?
) : IRequest<Result<string>>; // Trả về JWT Token nội bộ