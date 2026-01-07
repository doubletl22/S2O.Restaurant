using MediatR;

namespace S2O.Shared.Kernel.Primitives;

// Domain Event là 1 Notification trong MediatR
public interface IDomainEvent : INotification
{
    Guid EventId { get; }
    DateTime OccurredOn { get; }
}