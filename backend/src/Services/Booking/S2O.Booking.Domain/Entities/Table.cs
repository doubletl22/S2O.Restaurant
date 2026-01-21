using S2O.Shared.Kernel.Primitives;

namespace S2O.Booking.Domain.Entities;

// Entity này đại diện cho Bàn trong ngữ cảnh Booking
public class Table : Entity, IMustHaveTenant, IMustHaveBranch
{
    public new Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? BranchId { get; set; } // Bàn thuộc chi nhánh nào

    public string Name { get; set; } = default!; // Tên bàn (VD: Bàn 1, VIP 2)
    public int Capacity { get; set; } // Sức chứa (quan trọng để gợi ý bàn phù hợp)

    public bool IsActive { get; set; } = true; // Bàn có đang hoạt động không
    public bool IsOccupied { get; set; } = false; // Trạng thái hiện tại (Optional cho Booking)
}