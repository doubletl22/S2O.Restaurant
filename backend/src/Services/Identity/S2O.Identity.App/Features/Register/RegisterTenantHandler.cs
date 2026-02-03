using MediatR;
using MassTransit;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using S2O.Shared.Kernel.IntegrationEvents;
using System.Security.Claims;

namespace S2O.Identity.App.Features.Register;

public class RegisterTenantHandler : IRequestHandler<RegisterTenantCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IPublishEndpoint _publishEndpoint;


    public RegisterTenantHandler(UserManager<ApplicationUser> userManager,
             RoleManager<ApplicationRole> roleManager,
             IPublishEndpoint publishEndpoint)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<Guid>> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Email
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure(new Error("Identity.DuplicateEmail", "Email này đã được sử dụng."));
        }

        // 2. Sinh ID định danh
        var newTenantId = Guid.NewGuid();
        var defaultBranchId = Guid.NewGuid(); 

        // 3. Tạo User (Owner) gán trực tiếp vào Tenant và Branch vừa tạo
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.OwnerName,
            PhoneNumber = request.PhoneNumber,
            IsActive = true,
            TenantId = newTenantId,   
            BranchId = defaultBranchId, 
            CreatedAtUtc = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Result<Guid>.Failure(new Error("Identity.Error", createResult.Errors.First().Description));
        }

        if (!await _roleManager.RoleExistsAsync("RestaurantOwner"))
        {
            await _roleManager.CreateAsync(new ApplicationRole { Name = "RestaurantOwner" });
        }
        await _userManager.AddToRoleAsync(user, "RestaurantOwner");

        var claims = new List<Claim>
    {
        new Claim("tenant_id", newTenantId.ToString()),
        new Claim("branch_id", defaultBranchId.ToString()), 
        new Claim("restaurant_name", request.RestaurantName)
    };
        await _userManager.AddClaimsAsync(user, claims);

        await _publishEndpoint.Publish(new TenantCreatedEvent(
        newTenantId,
        defaultBranchId,
        request.RestaurantName,
        request.Address,
        request.PhoneNumber), cancellationToken);

        return Result<Guid>.Success(newTenantId);
    }
}