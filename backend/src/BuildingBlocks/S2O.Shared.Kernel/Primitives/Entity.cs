namespace S2O.Shared.Kernel.Primitives;

public abstract class Entity
{
    public Guid Id { get; init; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    protected Entity(Guid id) => Id = id;
    protected Entity() => Id = Guid.NewGuid();
}

public abstract class AggregateRoot : Entity
{
    // Dùng cho mô hình CQRS và Domain Events sau này
}