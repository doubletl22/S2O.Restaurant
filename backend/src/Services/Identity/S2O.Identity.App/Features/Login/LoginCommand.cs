using MediatR;
using S2O.Identity.App.DTOs;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<LoginResponse>>;