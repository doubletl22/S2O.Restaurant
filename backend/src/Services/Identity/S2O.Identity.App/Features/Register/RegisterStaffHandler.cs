using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Identity;
<<<<<<< HEAD
using S2O.Identity.Domain.Entities; 
=======
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
>>>>>>> 7fc186dbe (fix owner)
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterStaffHandler : IRequestHandler<RegisterStaffCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
<<<<<<< HEAD
    private readonly RoleManager<ApplicationRole> _roleManager;
    public RegisterStaffHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
=======
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
>>>>>>> 7fc186dbe (fix owner)
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
<<<<<<< HEAD
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
=======
            TenantId = currentTenantId.Value, // lấy theo Owner
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Result<Guid>.Failure(new Error("Identity.RegisterFailed", createResult.Errors.First().Description));
        }

        // 2) Gán Role "Staff" (hiện hệ thống chỉ seed role Staff)
        await _userManager.AddToRoleAsync(user, "Staff");

        // 3) Gán Branch cho staff (để FE hiển thị đúng chi nhánh)
        _context.UserBranches.Add(new UserBranch
        {
            UserId = user.Id,
            BranchId = request.BranchId
        });
        await _context.SaveChangesAsync(cancellationToken);

        // 4) Thêm Claim BranchId (để token chứa thông tin chi nhánh)
        await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("branch_id", request.BranchId.ToString()));
>>>>>>> 7fc186dbe (fix owner)

        return Result<Guid>.Success(user.Id);
    }
}
