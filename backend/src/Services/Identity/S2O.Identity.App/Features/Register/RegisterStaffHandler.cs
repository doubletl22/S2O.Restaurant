using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterStaffHandler : IRequestHandler<RegisterStaffCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    public RegisterStaffHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<Guid>> Handle(RegisterStaffCommand request, CancellationToken cancellationToken)
    {
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
}