using S2O.Shared.Kernel.Abstractions;

namespace S2O.Identity.App.Features.Login;

public record LoginCommand(string Email, string Password) : ICommand<string>;