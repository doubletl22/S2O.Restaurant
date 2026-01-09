namespace S2O.Shared.Kernel.Primitives;

public interface IAuditableEntity
{
    // Thông tin lúc tạo
    DateTime CreatedAtUtc { get; set; }
    string? CreatedBy { get; set; }

    // Thông tin lúc cập nhật cuối cùng
    DateTime? LastModifiedAtUtc { get; set; }
    string? LastModifiedBy { get; set; }
}