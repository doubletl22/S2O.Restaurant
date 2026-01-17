using S2O.Shared.Kernel.Primitives;

namespace S2O.Identity.Domain.Entities;

public class UserBranch : Entity
{
    public Guid UserId { get; set; }
    public Guid BranchId { get; set; }
    public bool IsManager { get; set; }
}