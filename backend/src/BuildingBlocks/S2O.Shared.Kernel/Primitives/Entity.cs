namespace S2O.Shared.Kernel.Primitives;

public abstract class Entity<TId> : IEntity<TId>
{
    public TId Id { get; set; } = default!;

    // Triển khai Audit Log
    public DateTime? CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModified { get; set; }
    public string? LastModifiedBy { get; set; }
}