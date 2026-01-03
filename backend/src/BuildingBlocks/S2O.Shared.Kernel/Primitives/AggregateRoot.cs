using System;
using System.Collections.Generic;

namespace S2O.Shared.Kernel.Primitives;

public abstract class AggregateRoot<TId> : IEntity<TId>
{
    // Triển khai IEntity<TId>
    public TId Id { get; set; } = default!;

    // Triển khai IEntity (Audit info)
    public DateTime? CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    // Domain Events storage
    private readonly List<IDomainEvent> _domainEvents = new();

    // Sửa lại kiểu trả về là IReadOnlyCollection để đúng chuẩn hơn
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}