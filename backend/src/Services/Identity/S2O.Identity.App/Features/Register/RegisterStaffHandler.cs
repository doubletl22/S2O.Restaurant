using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Identity;
<<<<<<< HEAD
using S2O.Identity.Domain.Entities;
=======
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
>>>>>>> 020ff61bf (fix err big)
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterStaffHandler : IRequestHandler<RegisterStaffCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
<<<<<<< HEAD
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
        RoleManager<ApplicationRole> roleManager,
        ITenantContext tenantContext,
        IAuthDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tenantContext = tenantContext;
        _context = context;
>>>>>>> 020ff61bf (fix err big)
    }

    public async Task<Result<Guid>> Handle(RegisterStaffCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantContext.TenantId;

        if (tenantId is null || tenantId == Guid.Empty)
        {
            return Result<Guid>.Failure(
                new Error("Auth.Invalid", "Chỉ Owner đã đăng nhập mới được tạo Staff.")
            );
        }

        var roleName = string.IsNullOrWhiteSpace(request.Role) ? "Staff" : request.Role.Trim();

        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            var roleCreate = await _roleManager.CreateAsync(new ApplicationRole { Name = roleName });

            if (!roleCreate.Succeeded)
            {
                var errors = string.Join(", ", roleCreate.Errors.Select(e => e.Description));
                return Result<Guid>.Failure(new Error("Identity.RoleCreateFailed", errors));
            }
        }

        if (string.IsNullOrWhiteSpace(request.Email))
            return Result<Guid>.Failure(new Error("Auth.Validation", "Email không được để trống."));

        if (string.IsNullOrWhiteSpace(request.Password))
            return Result<Guid>.Failure(new Error("Auth.Validation", "Mật khẩu không được để trống."));

        Guid? branchId = request.BranchId == Guid.Empty ? null : request.BranchId;

        // ✅ ép về string không-null để dập warning CS8601
        var fullName = (request.FullName ?? string.Empty).Trim();
        var phoneNumber = (request.PhoneNumber ?? string.Empty).Trim();

        var user = new ApplicationUser
        {
<<<<<<< HEAD
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            BranchId = request.BranchId,
            TenantId = request.TenantId,
            PhoneNumber = request.PhoneNumber,
=======
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),

            FullName = fullName,          // ✅ không null
            PhoneNumber = phoneNumber,    // ✅ không null

            TenantId = tenantId.Value,
            BranchId = branchId,

>>>>>>> 020ff61bf (fix err big)
            IsActive = true,
            EmailConfirmed = true
        };

<<<<<<< HEAD
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
        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            return Result<Guid>.Failure(new Error("Identity.RegisterFailed", errors));
        }

        var addRoleResult = await _userManager.AddToRoleAsync(user, roleName);
        if (!addRoleResult.Succeeded)
        {
            var errors = string.Join(", ", addRoleResult.Errors.Select(e => e.Description));
            return Result<Guid>.Failure(new Error("Identity.AddRoleFailed", errors));
        }

        if (branchId.HasValue && _context.UserBranches != null)
        {
            _context.UserBranches.Add(new UserBranch
            {
                UserId = user.Id,
                BranchId = branchId.Value
            });

            await _context.SaveChangesAsync(cancellationToken);
        }

        var claims = new List<Claim>
        {
            new Claim("tenant_id", tenantId.Value.ToString()),
            new Claim("role", roleName)
        };

        if (branchId.HasValue)
            claims.Add(new Claim("branch_id", branchId.Value.ToString()));

        if (!string.IsNullOrWhiteSpace(fullName))
            claims.Add(new Claim("full_name", fullName));

        var addClaimsResult = await _userManager.AddClaimsAsync(user, claims);
        if (!addClaimsResult.Succeeded)
        {
            var errors = string.Join(", ", addClaimsResult.Errors.Select(e => e.Description));
            return Result<Guid>.Failure(new Error("Identity.AddClaimsFailed", errors));
        }
>>>>>>> 020ff61bf (fix err big)

        return Result<Guid>.Success(user.Id);
    }
}