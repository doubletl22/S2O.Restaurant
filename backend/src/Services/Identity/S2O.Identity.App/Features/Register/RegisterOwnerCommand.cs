using S2O.Shared.Kernel.Abstractions;

namespace S2O.Auth.App.Features.Register;

public record RegisterOwnerCommand(
    string Email,
    string Password,
    string FullName,
    string RestaurantName) : ICommand<Guid>;