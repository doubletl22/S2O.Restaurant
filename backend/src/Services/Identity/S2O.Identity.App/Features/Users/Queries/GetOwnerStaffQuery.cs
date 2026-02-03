using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Queries;

public class StaffDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!;
    public string Role { get; set; } = default!;
    public Guid? BranchId { get; set; }
    public bool IsActive { get; set; }
}

public record GetOwnerStaffQuery(Guid TenantId, Guid? BranchId, string? Keyword) : IRequest<Result<List<StaffDto>>>;

public class GetOwnerStaffHandler : IRequestHandler<GetOwnerStaffQuery, Result<List<StaffDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public GetOwnerStaffHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<List<StaffDto>>> Handle(GetOwnerStaffQuery request, CancellationToken cancellationToken)
    {
        var query = _userManager.Users.Where(u => u.TenantId == request.TenantId);

        if (request.BranchId.HasValue)
        {
            query = query.Where(u => u.BranchId == request.BranchId);
        }

        if (!string.IsNullOrEmpty(request.Keyword))
        {
            query = query.Where(u =>
                u.FullName.Contains(request.Keyword) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(request.Keyword))
            );
        }

        var users = await query.ToListAsync(cancellationToken);
        var staffList = new List<StaffDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            Guid userId = Guid.Parse(user.Id.ToString());

            staffList.Add(new StaffDto
            {
                Id = userId,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber ?? "",
                Role = roles.FirstOrDefault() ?? "Staff",
                BranchId = user.BranchId,
                IsActive = user.IsActive
            });
        }

        return Result<List<StaffDto>>.Success(staffList);
    }
}