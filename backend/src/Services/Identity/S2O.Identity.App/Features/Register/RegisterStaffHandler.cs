using System.Security.Claims;
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

        if (!await _roleManager.RoleExistsAsync(request.Role))
        {
            var newRole = new ApplicationRole { Name = request.Role };
            await _roleManager.CreateAsync(newRole);
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
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

        await _userManager.AddToRoleAsync(user, request.Role);

        var claims = new List<Claim>
        {
            new Claim("tenant_id", request.TenantId.ToString()),
            new Claim("branch_id", request.BranchId.ToString()),
            new Claim("full_name", request.FullName),
            new Claim("role", request.Role)
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