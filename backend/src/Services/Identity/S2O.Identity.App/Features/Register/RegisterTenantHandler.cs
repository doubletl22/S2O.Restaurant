using MediatR;
using MassTransit;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Results;
using S2O.Shared.Kernel.IntegrationEvents;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace S2O.Identity.App.Features.Register;

public class RegisterTenantHandler : IRequestHandler<RegisterTenantCommand, Result<Guid>>
{
    private static readonly Regex PhoneRegex = new("^0\\d{9}$", RegexOptions.Compiled);

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
        var validationError = ValidateRequest(request);
        if (validationError is not null)
        {
            return Result<Guid>.Failure(validationError);
        }

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
        request.PhoneNumber,
        request.PlanType), cancellationToken);

        return Result<Guid>.Success(newTenantId);
    }

    private static Error? ValidateRequest(RegisterTenantCommand request)
    {
        if (string.IsNullOrWhiteSpace(request.RestaurantName))
        {
            return new Error("Identity.Validation", "RestaurantName is required.");
        }

        if (string.IsNullOrWhiteSpace(request.OwnerName))
        {
            return new Error("Identity.Validation", "OwnerName is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Address))
        {
            return new Error("Identity.Validation", "Address is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return new Error("Identity.Validation", "Email is required.");
        }

        var email = request.Email.Trim();
        try
        {
            var parsed = new System.Net.Mail.MailAddress(email);
            if (!string.Equals(parsed.Address, email, StringComparison.OrdinalIgnoreCase))
            {
                return new Error("Identity.Validation", "Email is invalid.");
            }
        }
        catch
        {
            return new Error("Identity.Validation", "Email is invalid.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Trim().Length < 6)
        {
            return new Error("Identity.Validation", "Password must be at least 6 characters.");
        }

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            return new Error("Identity.Validation", "PhoneNumber is required.");
        }

        var phone = request.PhoneNumber.Trim();
        if (!PhoneRegex.IsMatch(phone))
        {
            return new Error("Identity.Validation", "PhoneNumber is invalid. Expected 10 digits and starts with 0.");
        }

        if (string.IsNullOrWhiteSpace(request.PlanType))
        {
            return new Error("Identity.Validation", "PlanType is required.");
        }

        var plan = request.PlanType.Trim();
        var allowedPlans = new[] { "Free", "Premium", "Enterprise" };
        if (!allowedPlans.Any(x => string.Equals(x, plan, StringComparison.OrdinalIgnoreCase)))
        {
            return new Error("Identity.Validation", "PlanType is invalid. Allowed values: Free, Premium, Enterprise.");
        }

        return null;
    }
}