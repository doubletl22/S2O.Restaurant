using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.DTOs;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Queries;

public record GetOwnerStaffQuery(string? Keyword = null) : IRequest<Result<List<StaffDto>>>;

public class GetOwnerStaffHandler : IRequestHandler<GetOwnerStaffQuery, Result<List<StaffDto>>>
{
    private readonly IAuthDbContext _context;
    private readonly ICurrentUserService _currentUser; // Cần cái này để lấy TenantId của Owner

    public GetOwnerStaffHandler(IAuthDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<StaffDto>>> Handle(GetOwnerStaffQuery request, CancellationToken ct)
    {
        var tenantId = _currentUser.TenantId;
        if (tenantId == null) return Result<List<StaffDto>>.Failure(new Error("Forbidden", "Không xác định được nhà hàng"));

        // Query: Lấy User thuộc Tenant này, join Role, join Branch
        var query = from u in _context.Users.AsNoTracking()
                    where u.TenantId == tenantId // QUAN TRỌNG: Chỉ lấy user cùng Tenant

                    // Join Role
                    join ur in _context.UserRoles on u.Id equals ur.UserId
                    join r in _context.Roles on ur.RoleId equals r.Id
                    where r.Name != "RestaurantOwner" // Không lấy chính ông chủ, chỉ lấy nhân viên

                    // Join Branch (Left Join)
                    join ub in _context.UserBranches on u.Id equals ub.UserId into userBranches
                    from ub in userBranches.DefaultIfEmpty()

                    select new
                    {
                        u,
                        RoleName = r.Name,
                        BranchId = ub != null ? (Guid?)ub.BranchId : null
                    };

        if (!string.IsNullOrEmpty(request.Keyword))
        {
            var k = request.Keyword.ToLower();
            query = query.Where(x => x.u.FullName.ToLower().Contains(k) || x.u.Email.ToLower().Contains(k));
        }

        var data = await query.ToListAsync(ct);

        var result = data.Select(x => new StaffDto
        {
            Id = x.u.Id,
            FullName = x.u.FullName,
            Email = x.u.Email!,
            PhoneNumber = x.u.PhoneNumber ?? "",
            Role = x.RoleName!,
            BranchId = x.BranchId,
            IsActive = x.u.IsActive
        }).ToList();

        return Result<List<StaffDto>>.Success(result);
    }
}