using System.Security.Claims;
using System.Net.Mail;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Abstractions;
using S2O.Identity.App.Features.Plans;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterStaffHandler : IRequestHandler<RegisterStaffCommand, Result<Guid>>
{
    private static readonly HashSet<string> AllowedStaffRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Staff",
        "RestaurantStaff",
        "Manager",
        "Chef",
        "Waiter"
    };

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IAuthDbContext _context;
    private readonly ITenantSubscriptionReader _subscriptionReader;

    public RegisterStaffHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IAuthDbContext context,
        ITenantSubscriptionReader subscriptionReader)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _subscriptionReader = subscriptionReader;
    }

    public async Task<Result<Guid>> Handle(RegisterStaffCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            return Result<Guid>.Failure(new Error("Staff.InvalidEmail", "Email không hợp lệ."));
        }

        try
        {
            _ = new MailAddress(normalizedEmail);
        }
        catch
        {
            return Result<Guid>.Failure(new Error("Staff.InvalidEmail", "Email không hợp lệ."));
        }

        var normalizedFullName = request.FullName?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedFullName))
        {
            return Result<Guid>.Failure(new Error("Staff.InvalidFullName", "Họ tên không hợp lệ."));
        }

        var normalizedRole = request.Role?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedRole) || !AllowedStaffRoles.Contains(normalizedRole))
        {
            return Result<Guid>.Failure(new Error("Role.Invalid", "Vai trò không hợp lệ cho nhân viên."));
        }

        if (request.BranchId == Guid.Empty)
        {
            return Result<Guid>.Failure(new Error("Branch.Invalid", "Chi nhánh không hợp lệ."));
        }

        var subscriptionResult = await _subscriptionReader.GetTenantSubscriptionAsync(request.TenantId, cancellationToken);
        if (subscriptionResult.IsFailure)
        {
            return Result<Guid>.Failure(subscriptionResult.Error!);
        }

        var subscription = subscriptionResult.Value;
        if (subscription.IsLocked || !subscription.IsActive || subscription.IsSubscriptionExpired)
        {
            return Result<Guid>.Failure(new Error("Tenant.SubscriptionBlocked", "Gói dịch vụ đã hết hạn hoặc tenant đang bị khóa."));
        }

        var maxStaff = GetQuota(subscription.PlanType);
        if (maxStaff != int.MaxValue)
        {
            var currentStaff = await CountTenantStaffAsync(request.TenantId, cancellationToken);
            if (currentStaff >= maxStaff)
            {
                return Result<Guid>.Failure(new Error("Quota.StaffExceeded", $"Gói {subscription.PlanType} cho phép tối đa {maxStaff} nhân sự."));
            }
        }

        if (!await _roleManager.RoleExistsAsync(normalizedRole))
        {
            var newRole = new ApplicationRole { Name = normalizedRole };
            await _roleManager.CreateAsync(newRole);
        }

        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            FullName = normalizedFullName,
            BranchId = request.BranchId,
            TenantId = request.TenantId,
            PhoneNumber = request.PhoneNumber,
            IsActive = true,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result<Guid>.Failure(new Error("Identity.RegisterFailed", errors));
        }

        await _userManager.AddToRoleAsync(user, normalizedRole);

        var claims = new List<Claim>
        {
            new Claim("tenant_id", request.TenantId.ToString()),
            new Claim("branch_id", request.BranchId.ToString()),
            new Claim("full_name", normalizedFullName),
            new Claim("role", normalizedRole)
        };
        await _userManager.AddClaimsAsync(user, claims);

        return Result<Guid>.Success(user.Id);
    }

    private async Task<int> CountTenantStaffAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var staffCount = await (
            from user in _context.Users
            where user.TenantId == tenantId
            join userRole in _context.UserRoles on user.Id equals userRole.UserId
            join role in _context.Roles on userRole.RoleId equals role.Id
            where role.Name != "RestaurantOwner" && role.Name != "SystemAdmin"
            select user.Id)
            .Distinct()
            .CountAsync(cancellationToken);

        return staffCount;
    }

    private static int GetQuota(string planType)
    {
        return planType switch
        {
            "Premium" => 100,
            "Enterprise" => int.MaxValue,
            _ => 10
        };
    }
}