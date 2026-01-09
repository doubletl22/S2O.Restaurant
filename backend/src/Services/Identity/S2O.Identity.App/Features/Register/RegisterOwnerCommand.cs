using S2O.Shared.Kernel.Abstractions;

namespace S2O.Identity.App.Features.Register;

public record RegisterOwnerCommand(
    string Email,
    string Password,
    string FullName,
    string RestaurantName) : ICommand<Guid>;