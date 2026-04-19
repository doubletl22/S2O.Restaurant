using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Users.Queries;

public class StaffDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!;
    public string Role { get; set; } = default!;
    public Guid? BranchId { get; set; }
    public bool IsActive { get; set; }
}

public record GetOwnerStaffQuery(Guid TenantId, Guid? BranchId, string? Keyword) : IRequest<Result<List<StaffDto>>>;

public class GetOwnerStaffHandler : IRequestHandler<GetOwnerStaffQuery, Result<List<StaffDto>>>
{
    private static readonly HashSet<string> ProtectedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "RestaurantOwner",
        "SystemAdmin"
    };

    private readonly UserManager<ApplicationUser> _userManager;

    public GetOwnerStaffHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<List<StaffDto>>> Handle(GetOwnerStaffQuery request, CancellationToken cancellationToken)
    {
        var validationError = ValidateRequest(request);
        if (validationError is not null)
        {
            return validationError;
        }

        var normalizedKeyword = NormalizeKeyword(request.Keyword);

        var query = _userManager.Users
            .AsNoTracking()
            .Where(u => u.TenantId == request.TenantId);

        if (request.BranchId.HasValue)
        {
            query = query.Where(u => u.BranchId == request.BranchId);
        }

        if (!string.IsNullOrWhiteSpace(normalizedKeyword))
        {
            var keyword = normalizedKeyword!;
            query = query.Where(u =>
                (u.FullName != null && u.FullName.Contains(keyword)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(keyword)) ||
                (u.Email != null && u.Email.Contains(keyword))
            );
        }

        var users = await query.ToListAsync(cancellationToken);
        var staffList = new List<StaffDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var primaryRole = roles.FirstOrDefault() ?? "Staff";

            // Bỏ qua RestaurantOwner và SystemAdmin - chỉ hiển thị staff
            if (IsProtectedRole(primaryRole))
            {
                continue;
            }

            staffList.Add(MapToStaffDto(user, primaryRole));
        }

        return Result<List<StaffDto>>.Success(staffList);
    }

    private static Result<List<StaffDto>>? ValidateRequest(GetOwnerStaffQuery request)
    {
        if (request.TenantId == Guid.Empty)
        {
            return Result<List<StaffDto>>.Failure(new Error("Staff.InvalidTenant", "TenantId không hợp lệ."));
        }

        return null;
    }

    private static string? NormalizeKeyword(string? keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return null;
        }

        var trimmed = keyword.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }

    private static bool IsProtectedRole(string? role)
    {
        return !string.IsNullOrWhiteSpace(role) && ProtectedRoles.Contains(role);
    }

    private static StaffDto MapToStaffDto(ApplicationUser user, string role)
    {
        return new StaffDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName ?? string.Empty,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            Role = role,
            BranchId = user.BranchId,
            IsActive = user.IsActive
        };
    }
}