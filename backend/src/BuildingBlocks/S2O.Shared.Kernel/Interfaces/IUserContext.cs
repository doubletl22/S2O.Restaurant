namespace S2O.Shared.Kernel.Interfaces;

public interface IUserContext
{
    Guid? UserId { get; }
    string? Email { get; }
}