using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterStaffHandler : IRequestHandler<RegisterStaffCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITenantContext _tenantContext;
    private readonly IAuthDbContext _context;

    public RegisterStaffHandler(
        UserManager<ApplicationUser> userManager,
        ITenantContext tenantContext,
        IAuthDbContext context
    )
    {
        _userManager = userManager;
        _tenantContext = tenantContext;
        _context = context;
    }

    public async Task<Result<Guid>> Handle(RegisterStaffCommand request, CancellationToken cancellationToken)
    {
        var currentTenantId = _tenantContext.TenantId;
        if (currentTenantId is null)
        {
            return Result<Guid>.Failure(new Error("Identity.TenantNotFound", "TenantId is missing in tenant context."));
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,

            TenantId = currentTenantId.Value,
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Result<Guid>.Failure(
                new Error("Identity.RegisterFailed", createResult.Errors.First().Description)
            );
        }

        await _userManager.AddToRoleAsync(user, "Staff");

        _context.UserBranches.Add(new UserBranch
        {
            UserId = user.Id,
            BranchId = request.BranchId
        });
        await _context.SaveChangesAsync(cancellationToken);

        await _userManager.AddClaimAsync(user, new Claim("branch_id", request.BranchId.ToString()));

        return Result<Guid>.Success(user.Id);
    }
}