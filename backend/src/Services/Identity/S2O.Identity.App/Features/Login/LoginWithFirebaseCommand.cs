using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Login;

public record LoginWithFirebaseCommand(
    string FirebaseToken,
    Guid? TenantId
) : IRequest<Result<string>>;