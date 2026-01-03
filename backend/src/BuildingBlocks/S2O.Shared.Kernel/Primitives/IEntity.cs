using System;

namespace S2O.Shared.Kernel.Primitives;

// 1. Interface phi Generic (Dùng để Audit log chung mà không cần biết kiểu ID)
public interface IEntity
{
    DateTime? CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTime? LastModified { get; set; }
    string? LastModifiedBy { get; set; }
}

// 2. Interface Generic (Kế thừa cái trên, thêm ID)
public interface IEntity<TId> : IEntity
{
    TId Id { get; set; }
}