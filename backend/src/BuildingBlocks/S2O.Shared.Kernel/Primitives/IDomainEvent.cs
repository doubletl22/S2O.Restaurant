using MediatR;

namespace S2O.Shared.Kernel.Primitives
{
    public interface IDomainEvent : INotification
    {
        Guid EventId => Guid.NewGuid();
        DateTime OccurredOn => DateTime.UtcNow;
    }
}